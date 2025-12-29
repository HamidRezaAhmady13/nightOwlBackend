import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entity/comment.entity';
import { MediaService } from 'src/media/media.service';
import { NotificationModule } from 'src/notifications/notification.module';
import { Media } from 'src/post/entity/media.entity';
import { Post } from 'src/post/entity/posts.entity';
import { PostController } from 'src/post/post.controller';
import { PostService } from 'src/post/post.service';
import { RedisModule } from 'src/redis/redis.module';
import { User } from 'src/user/entity/user.entity';

@Module({
  controllers: [PostController],
  providers: [PostService, MediaService],
  imports: [
    TypeOrmModule.forFeature([Post, Media, Comment, User]),
    forwardRef(() => NotificationModule),
    RedisModule,
  ],
  exports: [PostService],
})
export class PostModule {}
