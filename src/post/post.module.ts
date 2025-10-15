import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MediaService } from 'src/media/media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/posts.entity';
import { Media } from './entity/media.entity';
import { Comment } from 'src/comment/entity/comment.entity';
import { User } from 'src/user/entity/user.entity';

@Module({
  controllers: [PostController],
  providers: [PostService, MediaService],
  imports: [TypeOrmModule.forFeature([Post, Media, Comment, User])],
})
export class PostModule {}
