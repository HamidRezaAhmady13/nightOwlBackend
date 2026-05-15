import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/core/redis/redis.module';
import { Comment } from 'src/modules/comment/entity/comment.entity';
import { NotificationModule } from 'src/modules/notifications/notification.module';
import { Media } from 'src/modules/post/entity/media.entity';
import { Post } from 'src/modules/post/entity/posts.entity';
import { PostController } from 'src/modules/post/post.controller';
import { PostService } from 'src/modules/post/post.service';
import { User } from 'src/modules/user/entity/user.entity';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [
    TypeOrmModule.forFeature([Post, Media, Comment, User]),
    forwardRef(() => NotificationModule),
    RedisModule,
  ],
  exports: [PostService],
})
export class PostModule {}
