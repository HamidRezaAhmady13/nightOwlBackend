import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entity/posts.entity';
import { User } from 'src/user/entity/user.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entity/comment.entity';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [TypeOrmModule.forFeature([Comment, Post, User])],
})
export class CommentModule {}
