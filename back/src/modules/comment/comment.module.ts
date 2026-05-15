import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/core/redis/redis.module';
import { CommentController } from 'src/modules/comment/comment.controller';
import { CommentService } from 'src/modules/comment/comment.service';
import { Comment } from 'src/modules/comment/entity/comment.entity';
import { NotificationModule } from 'src/modules/notifications/notification.module';
import { Post } from 'src/modules/post/entity/posts.entity';
import { User } from 'src/modules/user/entity/user.entity';

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
