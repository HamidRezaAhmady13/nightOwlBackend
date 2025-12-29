import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from 'src/comment/comment.controller';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/entity/comment.entity';
import { NotificationModule } from 'src/notifications/notification.module';
import { Post } from 'src/post/entity/posts.entity';
import { RedisModule } from 'src/redis/redis.module';
import { User } from 'src/user/entity/user.entity';

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
