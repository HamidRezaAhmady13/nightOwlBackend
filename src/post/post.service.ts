import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, Repository } from 'typeorm';

import * as fs from 'fs';
import * as path from 'path';

import { extractQualityFromFilename } from 'src/common/utils/extractQualityFromFilename';
import { toUrlPath } from 'src/common/utils/toUrlPth';
import { MediaService } from 'src/media/media.service';
import { NotificationService } from 'src/notifications/notification.service';
import { RedisService } from 'src/redis/redis.service';
import { SocketService } from 'src/socket/socket.service';
import { User } from 'src/user/entity/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Media } from './entity/media.entity';
import { Post } from './entity/posts.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mediaService: MediaService,
    private readonly redis: RedisService,
    private readonly socketService: SocketService,
    private readonly notificationService: NotificationService,
  ) {}
  private readonly logger = new Logger(PostService.name);
  async getPostsCursor(
    userId: string,
    opts: { limit?: number; cursor?: string },
  ) {
    const limit = Math.min(50, opts.limit ?? 24);
    const take = limit + 1; // fetch one extra to detect more pages

    // parse cursor: expected "ISOtimestamp|uuid"
    let cursorTs: string | undefined;
    let cursorId: string | undefined;
    if (opts.cursor) {
      const parts = String(opts.cursor).split('|');
      cursorTs = parts[0];
      cursorId = parts[1];
    }

    // 1) Posts-only pagination query (no joins)
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

    // 2) Decide returned page items and nextCursor deterministically
    let nextCursor: string | null = null;
    let pageItems = posts;

    if (posts.length === take) {
      // we got one extra row; return first `limit` items and set cursor to last returned item
      pageItems = posts.slice(0, limit);
      const lastReturned = pageItems[pageItems.length - 1];
      nextCursor = `${lastReturned.createdAt.toISOString()}|${lastReturned.id}`;
    } else {
    }

    // 3) Fetch media for the returned items only and map by post.id
    const ids = pageItems.map((p) => p.id);
    const mediaMap = new Map<string, Media[]>();

    if (ids.length) {
      const mediaQb = this.mediaRepository
        .createQueryBuilder('media')
        .leftJoinAndSelect('media.post', 'post')
        .where('post.id IN (:...ids)', { ids });

      const mediaRows = await mediaQb.getMany();

      for (const m of mediaRows) {
        // support both relations and raw postId
        const postId = (m as any).post ? (m as any).post.id : (m as any).postId;
        if (!postId) continue;
        const arr = mediaMap.get(postId) ?? [];
        arr.push(m);
        mediaMap.set(postId, arr);
      }
    }

    // 4) Build previews deterministically (prefer thumbnails/images then non-video then first)
    const previews = pageItems.map((p) => {
      const mediaForPost = mediaMap.get(p.id) ?? [];
      const img =
        mediaForPost.find((m) =>
          /\.(webp|avif|jpe?g|png)$/i.test((m as any).url),
        ) ??
        mediaForPost.find((m) => !/\.(mp4|mov|webm)$/i.test((m as any).url)) ??
        mediaForPost[0];
      const imageUrl = img ? (img as any).url : null;

      if (!imageUrl) {
      }

      return {
        id: p.id,
        imageUrl,
        createdAt: p.createdAt,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
      };
    });

    return { items: previews, nextCursor };
  }

  async saveMediaRow(
    data: Partial<Media>,
    manager?: EntityManager,
  ): Promise<Media> {
    const repo = manager ? manager.getRepository(Media) : this.mediaRepository;
    const entity = repo.create(data);
    return repo.save(entity);
  }

  // Convenience: save multiple media rows using provided manager (transaction-friendly)
  async saveMediaBatch(
    items: Partial<Media>[],
    manager?: EntityManager,
  ): Promise<Media[]> {
    if (!items?.length) return [];
    const repo = manager ? manager.getRepository(Media) : this.mediaRepository;
    const entities = items.map((it) => repo.create(it));
    return repo.save(entities);
  }

  async createPost(
    dto: CreatePostDto,
    user: User,
    media?: Express.Multer.File,
  ) {
    if (!dto.content?.trim() && !media?.path) {
      throw new BadRequestException('Post must include content or media.');
    }

    const queryRunner =
      this.postRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1) create and save post
      const post = queryRunner.manager.create(Post, {
        content: dto.content,
        owner: user,
      });
      await queryRunner.manager.save(post);

      // 2) handle media if present
      if (media?.path) {
        // build final storage path
        const finalPath = buildFinalPath(media.originalname, user.id, post.id);

        // ensure destination exists and move file
        fs.mkdirSync(path.dirname(finalPath), { recursive: true });
        fs.renameSync(media.path, finalPath);

        const mimeType = media.mimetype;
        const ext = path.extname(media.originalname).toLowerCase();

        // If it's a video and supported ext, process video (thumbnails + mp4 variants)
        if (mimeType.startsWith('video/') && isVideoExt(ext)) {
          const processed = await this.mediaService.processVideo(
            finalPath,
            user.id,
            post.id,
            media.originalname,
          );

          // save mp4 variants
          for (const variantPath of processed.mp4Variants) {
            const quality = extractQualityFromFilename(variantPath);
            const relative = toUrlPath(variantPath);
            await queryRunner.manager.save(
              queryRunner.manager.create(Media, {
                type: 'video',
                url: relative,
                owner: user,
                post,
                quality,
              }),
            );
          }

          // save thumbnails
          for (const thumbPath of processed.thumbnails) {
            const relative = toUrlPath(thumbPath);
            await queryRunner.manager.save(
              queryRunner.manager.create(Media, {
                type: 'image',
                url: relative,
                owner: user,
                post,
              }),
            );
          }

          // save original video entry (use relative path)
          await queryRunner.manager.save(
            queryRunner.manager.create(Media, {
              type: 'video',
              url: toUrlPath(finalPath),
              owner: user,
              post,
              quality: 'original',
            }),
          );
        } else {
          // image or other file
          await queryRunner.manager.save(
            queryRunner.manager.create(Media, {
              type: mimeType.startsWith('image/') ? 'image' : 'file',
              url: toUrlPath(finalPath),
              owner: user,
              post,
            }),
          );
        }
      }

      // 3) increment postsCount atomically
      await queryRunner.manager.increment(
        User,
        { id: user.id },
        'postsCount',
        1,
      );

      await queryRunner.commitTransaction();

      // Return a fresh post instance (if you want the media loaded, fetch it separately)
      return post;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      // Optionally: cleanup moved files if necessary (left as exercise)
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // place this method in your service, replacing the previous getPostsCursor

  async getAllPosts(userId: string, opts: { limit: number; page: number }) {
    const skip = (opts.page - 1) * opts.limit;
    // Select only needed fields and first media item
    const qb = this.postRepository
      .createQueryBuilder('post')
      .where('post.ownerId = :userId', { userId }) // or join owner and filter by owner.id
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(opts.limit)
      .distinct(true);

    // left join media to get first image url (grouped)
    qb.leftJoinAndSelect('post.media', 'media');
    // if you want only first media you can use subquery or pick first client-side

    const [items, total] = await qb.getManyAndCount();

    // Map to PostPreview client shape
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

  async updatePost(
    postId: string,
    dto: UpdatePostDto, // e.g. { content?: string, replaceMedia?: boolean }
    currentUserId: string,
    newMedia?: Express.Multer.File,
  ) {
    const queryRunner =
      this.postRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const post = await queryRunner.manager.findOne(Post, {
        where: { id: postId },
        relations: ['owner', 'media'],
      });
      if (!post) throw new NotFoundException('Post not found');
      if (post.owner.id !== currentUserId) throw new ForbiddenException();

      // update simple fields
      if (dto.content !== undefined) post.content = dto.content;
      await queryRunner.manager.save(post);

      // optional media replacement flow
      if (dto.replaceMedia && newMedia) {
        // 1) remove existing media rows and delete files (delegate to MediaService)
        const existingMedia = post.media ?? [];
        if (existingMedia.length) {
          // MediaService should remove DB rows and unlink files atomically where possible
          await this.mediaService.removeMediaBatch(
            existingMedia.map((m) => m.id),
            queryRunner.manager,
          );
        }

        // 2) move/process new media and save rows via mediaService using queryRunner.manager
        const finalPath = buildFinalPath(
          newMedia.originalname,
          currentUserId,
          postId,
        );
        fs.mkdirSync(path.dirname(finalPath), { recursive: true });
        fs.renameSync(newMedia.path, finalPath);

        const mimeType = newMedia.mimetype;
        const ext = path.extname(newMedia.originalname).toLowerCase();
        if (mimeType.startsWith('video/') && isVideoExt(ext)) {
          const processed = await this.mediaService.processVideo(
            finalPath,
            currentUserId,
            postId,
            newMedia.originalname,
          );
          // save variants and thumbnails using queryRunner.manager
          for (const variantPath of processed.mp4Variants) {
            await queryRunner.manager.save(
              this.mediaRepository.create({
                type: 'video',
                url: toUrlPath(variantPath),
                owner: post.owner,
                post,
              }),
            );
          }
          for (const t of processed.thumbnails) {
            await queryRunner.manager.save(
              this.mediaRepository.create({
                type: 'image',
                url: toUrlPath(t),
                owner: post.owner,
                post,
              }),
            );
          }
          await queryRunner.manager.save(
            this.mediaRepository.create({
              type: 'video',
              url: toUrlPath(finalPath),
              owner: post.owner,
              post,
              quality: 'original',
            }),
          );
        } else {
          await queryRunner.manager.save(
            this.mediaRepository.create({
              type: mimeType.startsWith('image/') ? 'image' : 'file',
              url: toUrlPath(finalPath),
              owner: post.owner,
              post,
            }),
          );
        }
      }

      await queryRunner.commitTransaction();
      return post;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      // optionally cleanup any moved new files if needed
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deletePost(postId: string, currentUserId: string) {
    const queryRunner =
      this.postRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const post = await queryRunner.manager.findOne(Post, {
        where: { id: postId },
        relations: ['owner', 'media'],
      });
      if (!post) throw new NotFoundException('Post not found');
      if (post.owner.id !== currentUserId) throw new ForbiddenException();

      // delete media rows and files (delegate to MediaService)
      if (post.media && post.media.length) {
        await this.mediaService.removeMediaBatch(
          post.media.map((m) => m.id),
          queryRunner.manager,
        );
      }

      // delete the post
      await queryRunner.manager.delete(Post, { id: postId });

      // decrement postsCount
      await queryRunner.manager.decrement(
        User,
        { id: currentUserId },
        'postsCount',
        1,
      );

      await queryRunner.commitTransaction();

      // optional: remove physical post folder (uploads/user-<id>/post-<id>)
      try {
        const postDir = path.join(
          process.cwd(),
          'uploads',
          `user-${currentUserId}`,
          `post-${postId}`,
        );
        fs.rmSync(postDir, { recursive: true, force: true });
      } catch (e) {
        // ignore cleanup errors
      }

      return { message: 'Post deleted' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // async getFeed(currentUserId: string, limit = 2, page = 1) {
  //   const qb = this.postRepository
  //     .createQueryBuilder('post')
  //     .innerJoin('post.owner', 'owner')
  //     .innerJoin(
  //       'user_follows',
  //       'f',
  //       'f.follower_id = :currentUserId AND f.followed_id = owner.id',
  //       { currentUserId },
  //     )
  //     .leftJoinAndSelect('post.media', 'media')
  //     .leftJoinAndSelect('post.owner', 'postOwner')
  //     .leftJoinAndSelect('post.likedBy', 'likedBy')
  //     .leftJoinAndSelect('post.comments', 'comments')
  //     .addSelect('COUNT(*) OVER()', 'total_count')
  //     .orderBy('post.createdAt', 'DESC');
  //   // .take(limit)
  //   // .skip((page - 1) * limit);

  //   const { entities, raw } = await qb.getRawAndEntities(); // single DB roundtrip
  //   return {
  //     items: entities,
  //     total: raw.length ? Number(raw[0].total_count) : 0,
  //   };
  // }

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

    const total = await qb.getCount(); // full count without pagination

    this.logger.log(total);
    const items = await qb
      .take(limit)
      .skip((page - 1) * limit)
      .getMany();

    return { items, total };
  }

  async toggleLike(postId: string, user: User) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['likedBy', 'owner'],
    });
    if (!post) throw new NotFoundException('Post not found');

    const key = `post:${postId}:likes`;

    const alreadyLiked = post.likedBy.some((u) => u.id === user.id);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((u) => u.id !== user.id);
      --post.likesCount;
      await this.postRepository.save(post);
      await this.redis.decr(key);
      return { liked: false };
    }

    // NEW like path — update DB + redis
    post.likedBy.push(user);
    ++post.likesCount;
    const saved = await this.postRepository.save(post);
    await this.redis.incr(key);

    // Notify owner only if owner exists and is not the liker
    const owner = post.owner;
    if (owner && owner.id !== user.id) {
      const ntf = await this.notificationService.createForUser(owner.id, {
        type: 'like',
        smallBody: `${user.username ?? 'Someone'} liked your post`,
        payloadRef: { postId },
        meta: {},
        sourceId: postId,
      });

      const unread = await this.notificationService.countUnreadForUser(
        owner.id,
      );

      // emit via SocketService (recommended) or SocketGateway
      this.socketService.emitNotificationToUser(owner.id, ntf);
      this.socketService.emitUnreadCount(owner.id, unread);
      // or: this.socketGateway.emitNotificationToUser(owner.id, ntf);
    }

    return { liked: true, post: saved };
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
// helper stubs used above (move these to MediaService in real code)
function buildFinalPath(origName: string, userId: string, postId: string) {
  const safeName = origName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  const timestamp = Date.now();
  const ext = path.extname(origName).toLowerCase();
  return path.join(
    process.cwd(),
    'uploads',
    `user-${userId}`,
    `post-${postId}`,
    'original',
    `${safeName}-original-${timestamp}${ext}`,
  );
}
function isVideoExt(ext: string) {
  return [
    '.mp4',
    '.mov',
    '.mkv',
    '.avi',
    '.webm',
    '.flv',
    '.wmv',
    '.m4v',
  ].includes(ext);
}
