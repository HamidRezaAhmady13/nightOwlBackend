import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from 'src/notifications/notification.module';
import { Post } from 'src/post/entity/posts.entity';
import { RedisModule } from 'src/redis/redis.module';
import { User } from 'src/user/entity/user.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entity/comment.entity';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [
    TypeOrmModule.forFeature([Comment, Post, User]),
    RedisModule,
    NotificationModule,
  ],
})
export class CommentModule {}
