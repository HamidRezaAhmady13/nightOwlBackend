import { RedisModule } from '@/core/redis/redis.module';
import { CommentController } from '@/modules/comment/comment.controller';
import { CommentService } from '@/modules/comment/comment.service';
import { Comment } from '@/modules/comment/entity/comment.entity';
import { NotificationModule } from '@/modules/notifications/notification.module';
import { Post } from '@/modules/post/entity/posts.entity';
import { User } from '@/modules/user/entity/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
