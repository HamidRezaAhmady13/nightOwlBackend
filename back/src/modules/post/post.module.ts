import { RedisModule } from '@/core/redis/redis.module';
import { Comment } from '@/modules/comment/entity/comment.entity';
import { NotificationModule } from '@/modules/notifications/notification.module';
import { Media } from '@/modules/post/entity/media.entity';
import { Post } from '@/modules/post/entity/posts.entity';
import { PostController } from '@/modules/post/post.controller';
import { PostService } from '@/modules/post/post.service';
import { User } from '@/modules/user/entity/user.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { PostQueryService } from './post-query.service';

@Module({
  controllers: [PostController],
  providers: [PostService, MediaService, PostQueryService],
  imports: [
    TypeOrmModule.forFeature([Post, Media, Comment, User]),
    forwardRef(() => NotificationModule),
    RedisModule,
  ],
  exports: [PostService, MediaService, PostQueryService],
})
export class PostModule {}
