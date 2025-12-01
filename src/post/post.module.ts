import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entity/comment.entity';
import { MediaService } from 'src/media/media.service';
import { NotificationModule } from 'src/notifications/notification.module';
import { RedisModule } from 'src/redis/redis.module';
import { User } from 'src/user/entity/user.entity';
import { Media } from './entity/media.entity';
import { Post } from './entity/posts.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';

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
