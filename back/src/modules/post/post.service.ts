// import {
//   BadRequestException,
//   ForbiddenException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { RedisService } from '@/core/redis/redis.service';
// import { NotificationType } from '@/modules/notifications/dto/ntfDto';
// import { NotificationService } from '@/modules/notifications/notification.service';
// import { CreatePostDto } from '@/modules/post/dto/create-post.dto';
// import { UpdatePostDto } from '@/modules/post/dto/update-post.dto';
// import { Media } from '@/modules/post/entity/media.entity';
// import { Post } from '@/modules/post/entity/posts.entity';
// import { SocketService } from '@/modules/socket/socket.service';
// import { User } from '@/modules/user/entity/user.entity';
// import { MediaService } from './media.service';

// @Injectable()
// export class PostService {
//   constructor(
//     @InjectRepository(Post)
//     private readonly postRepository: Repository<Post>,
//     @InjectRepository(Media)
//     private readonly mediaRepository: Repository<Media>,
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//     private readonly redis: RedisService,
//     private readonly socketService: SocketService,
//     private readonly notificationService: NotificationService,
//     private readonly mediaService: MediaService,
//   ) {}

//   async createPost(
//     dto: CreatePostDto,
//     user: User,
//     media?: Express.Multer.File,
//   ) {
//     if (!dto.content?.trim() && !media?.path) {
//       throw new BadRequestException('Post must include content or media.');
//     }

//     const queryRunner =
//       this.postRepository.manager.connection.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const post = queryRunner.manager.create(Post, {
//         content: dto.content,
//         owner: user,
//       });
//       await queryRunner.manager.save(post);

//       if (media?.path) {
//         await this.mediaService.savePostMedia(
//           post.id,
//           user.id,
//           media,
//           queryRunner.manager,
//         );
//       }

//       await queryRunner.manager.increment(
//         User,
//         { id: user.id },
//         'postsCount',
//         1,
//       );

//       await queryRunner.commitTransaction();

//       return post;
//     } catch (err) {
//       await queryRunner.rollbackTransaction();
//       throw err;
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async updatePost(
//     postId: string,
//     dto: UpdatePostDto,
//     currentUserId: string,
//     newMedia?: Express.Multer.File,
//   ) {
//     const queryRunner =
//       this.postRepository.manager.connection.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();
//     try {
//       const post = await queryRunner.manager.findOne(Post, {
//         where: { id: postId },
//         relations: ['owner', 'media'],
//       });
//       if (!post) throw new NotFoundException('Post not found');
//       if (post.owner.id !== currentUserId) throw new ForbiddenException();

//       if (dto.content !== undefined) post.content = dto.content;
//       await queryRunner.manager.save(post);

//       if (dto.replaceMedia && newMedia) {
//         await this.mediaService.replacePostMedia(
//           post,
//           newMedia,
//           queryRunner.manager,
//         );
//       }

//       await queryRunner.commitTransaction();
//       return post;
//     } catch (err) {
//       await queryRunner.rollbackTransaction();
//       throw err;
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async deletePost(postId: string, currentUserId: string) {
//     const queryRunner =
//       this.postRepository.manager.connection.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();
//     try {
//       const post = await queryRunner.manager.findOne(Post, {
//         where: { id: postId },
//         relations: ['owner', 'media'],
//       });
//       if (!post) throw new NotFoundException('Post not found');
//       if (post.owner.id !== currentUserId) throw new ForbiddenException();

//       await this.mediaService.deletePostMedia(post, queryRunner.manager);

//       await queryRunner.manager.delete(Post, { id: postId });
//       await queryRunner.manager.decrement(
//         User,
//         { id: currentUserId },
//         'postsCount',
//         1,
//       );

//       await queryRunner.commitTransaction();
//       return { message: 'Post deleted' };
//     } catch (err) {
//       await queryRunner.rollbackTransaction();
//       throw err;
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async toggleLike(postId: string, user: User) {
//     const post = await this.postRepository.findOne({
//       where: { id: postId },
//       relations: ['likedBy', 'owner'],
//     });
//     if (!post) throw new NotFoundException('Post not found');

//     const key = `post:${postId}:likes`;

//     const alreadyLiked = post.likedBy.some((u) => u.id === user.id);

//     if (alreadyLiked) {
//       post.likedBy = post.likedBy.filter((u) => u.id !== user.id);
//       --post.likesCount;
//       await this.postRepository.save(post);
//       await this.redis.decr(key);
//       return { liked: false };
//     }

//     post.likedBy.push(user);
//     ++post.likesCount;
//     const saved = await this.postRepository.save(post);
//     await this.redis.incr(key);

//     const owner = post.owner;
//     if (owner && owner.id !== user.id) {
//       const ntf = await this.notificationService.createForUser(owner.id, {
//         type: NotificationType.Like,
//         sourceId: user.id,
//         postId: postId,
//         meta: {},
//       });

//       const unread = await this.notificationService.countUnreadForUser(
//         owner.id,
//       );

//       this.socketService.emitNotificationToUser(owner.id, ntf);
//       this.socketService.emitUnreadCount(owner.id, unread);
//     }

//     return { liked: true, post: saved };
//   }
// }

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RedisService } from '@/core/redis/redis.service';
import { NotificationType } from '@/modules/notifications/dto/ntfDto';
import { NotificationService } from '@/modules/notifications/notification.service';
import { CreatePostDto } from '@/modules/post/dto/create-post.dto';
import { UpdatePostDto } from '@/modules/post/dto/update-post.dto';
import { Post } from '@/modules/post/entity/posts.entity';
import { SocketService } from '@/modules/socket/socket.service';
import { User } from '@/modules/user/entity/user.entity';
import { MediaService } from './media.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly redis: RedisService,
    private readonly socketService: SocketService,
    private readonly notificationService: NotificationService,
    private readonly mediaService: MediaService,
  ) {}

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
      const post = queryRunner.manager.create(Post, {
        content: dto.content,
        owner: user,
      });
      await queryRunner.manager.save(post);

      if (media?.path) {
        await this.mediaService.savePostMedia(
          post.id,
          user.id,
          media,
          queryRunner.manager,
        );
      }

      await queryRunner.manager.increment(
        User,
        { id: user.id },
        'postsCount',
        1,
      );

      await queryRunner.commitTransaction();
      return post;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updatePost(
    postId: string,
    dto: UpdatePostDto,
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

      if (dto.content !== undefined) post.content = dto.content;
      await queryRunner.manager.save(post);

      if (dto.replaceMedia && newMedia) {
        await this.mediaService.replacePostMedia(
          post,
          newMedia,
          queryRunner.manager,
        );
      }

      await queryRunner.commitTransaction();
      return post;
    } catch (err) {
      await queryRunner.rollbackTransaction();
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

      await this.mediaService.deletePostMedia(post, queryRunner.manager);

      await queryRunner.manager.delete(Post, { id: postId });
      await queryRunner.manager.decrement(
        User,
        { id: currentUserId },
        'postsCount',
        1,
      );

      await queryRunner.commitTransaction();
      return { message: 'Post deleted' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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

    post.likedBy.push(user);
    ++post.likesCount;
    const saved = await this.postRepository.save(post);
    await this.redis.incr(key);

    const owner = post.owner;
    if (owner && owner.id !== user.id) {
      const ntf = await this.notificationService.createForUser(owner.id, {
        type: NotificationType.Like,
        sourceId: user.id,
        postId: postId,
        meta: {},
      });

      const unread = await this.notificationService.countUnreadForUser(
        owner.id,
      );

      this.socketService.emitNotificationToUser(owner.id, ntf);
      this.socketService.emitUnreadCount(owner.id, unread);
    }

    return { liked: true, post: saved };
  }
}
