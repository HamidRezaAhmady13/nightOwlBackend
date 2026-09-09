// import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';
import { Media } from '@/modules/post/entity/media.entity';
import { Post } from '@/modules/post/entity/posts.entity';
import { User } from '@/modules/user/entity/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class PostQueryService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly redis: RedisService,
  ) {}

  async getPostsCursor(
    userId: string,
    opts: { limit?: number; cursor?: string },
  ) {
    const limit = Math.min(50, opts.limit ?? 24);
    const take = limit + 1;
    let cursorTs: string | undefined;
    let cursorId: string | undefined;
    if (opts.cursor) {
      const [ts, id] = String(opts.cursor).split('|');
      cursorTs = ts;
      cursorId = id;
    }

    const qb = this.postRepository
      .createQueryBuilder('post')
      .where('post.ownerId = :userId', { userId })
      .orderBy('post.createdAt', 'DESC')
      .addOrderBy('post.id', 'DESC')
      .take(take);

    if (cursorTs && cursorId) {
      qb.andWhere(
        new Brackets((b) => {
          b.where('post."createdAt" < :cursorTs::timestamp', {
            cursorTs,
          }).orWhere(
            new Brackets((bb) => {
              bb.where('post."createdAt" = :cursorTs::timestamp', {
                cursorTs,
              }).andWhere('post.id < :cursorId::uuid', { cursorId });
            }),
          );
        }),
      );
    }

    const posts = await qb.getMany();

    let nextCursor: string | null = null;
    let pageItems = posts;
    if (posts.length === take) {
      pageItems = posts.slice(0, limit);
      const last = pageItems[pageItems.length - 1];
      nextCursor = `${last.createdAt.toISOString()}|${last.id}`;
    }

    const ids = pageItems.map((p) => p.id);
    const mediaMap = new Map<string, Media[]>();
    if (ids.length) {
      const mediaRows = await this.mediaRepository
        .createQueryBuilder('media')
        .leftJoinAndSelect('media.post', 'post')
        .where('post.id IN (:...ids)', { ids })
        .getMany();

      for (const m of mediaRows) {
        const postId = (m as any).post?.id ?? (m as any).postId;
        if (!postId) continue;
        const arr = mediaMap.get(postId) ?? [];
        arr.push(m);
        mediaMap.set(postId, arr);
      }
    }

    const previews = pageItems.map((p) => {
      const mediaForPost = mediaMap.get(p.id) ?? [];
      const img =
        mediaForPost.find((m) =>
          /\.(webp|avif|jpe?g|png)$/i.test((m as any).url),
        ) ??
        mediaForPost.find((m) => !/\.(mp4|mov|webm)$/i.test((m as any).url)) ??
        mediaForPost[0];
      return {
        id: p.id,
        imageUrl: img ? (img as any).url : null,
        content: p.content,
        createdAt: p.createdAt,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
      };
    });

    return { items: previews, nextCursor };
  }

  async getAllPosts(userId: string, opts: { limit: number; page: number }) {
    const skip = (opts.page - 1) * opts.limit;
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.media', 'media')
      .where('post.ownerId = :userId', { userId })
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(opts.limit)
      .distinct(true);

    const [items, total] = await qb.getManyAndCount();
    const previews = items.map((p) => ({
      id: p.id,
      imageUrl: p.media?.[0]?.url ?? null,
      createdAt: p.createdAt,
      likesCount: p.likesCount,
      commentsCount: p.commentsCount,
    }));
    return { items: previews, total };
  }

  async getPost(postId: string) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['owner', 'media', 'likedBy', 'comments'],
    });
    if (!post) throw new NotFoundException('Post not found');
    const likes = await this.redis.get(`post:${postId}:likes`);
    const comments = await this.redis.get(`post:${postId}:comments`);
    post.likesCount = Number(likes ?? post.likesCount);
    post.commentsCount = Number(comments ?? post.commentsCount);
    return post;
  }

  async getFeed(currentUserId: string, limit = 2, page = 1) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .innerJoin('post.owner', 'owner')
      .innerJoin(
        'user_follows',
        'f',
        'f.follower_id = :currentUserId AND f.followed_id = owner.id',
        { currentUserId },
      )
      .leftJoinAndSelect('post.media', 'media')
      .leftJoinAndSelect('post.owner', 'postOwner')
      .leftJoinAndSelect('post.likedBy', 'likedBy')
      .leftJoinAndSelect('post.comments', 'comments')
      .orderBy('post.createdAt', 'DESC');

    const total = await qb.getCount();
    const items = await qb
      .take(limit)
      .skip((page - 1) * limit)
      .getMany();
    return { items, total };
  }

  async getPublicFeed(limit = 20, page = 1) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.media', 'media')
      .leftJoinAndSelect('post.owner', 'postOwner')
      .leftJoinAndSelect('post.likedBy', 'likedBy')
      .leftJoinAndSelect('post.comments', 'comments')
      .orderBy('post.createdAt', 'DESC');

    const total = await qb.getCount();
    const items = await qb
      .take(limit)
      .skip((page - 1) * limit)
      .getMany();

    return { items, total };
  }

  async getLikes(postId: string, page = 1, limit = 20) {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.likedPosts', 'post', 'post.id = :postId', { postId })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }
}
