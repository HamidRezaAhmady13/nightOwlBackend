import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreatePostDto } from 'src/modules/post/dto/create-post.dto';
import { PostService } from 'src/modules/post/post.service';
import { User } from 'src/modules/user/entity/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('media', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const base =
            process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
          const tempDir = path.join(base, 'temp');
          fs.mkdirSync(tempDir, { recursive: true });
          cb(null, tempDir);
        },
        filename: (req, file, cb) => {
          const safeName = path
            .basename(file.originalname, path.extname(file.originalname))
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-_]/g, '');
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${safeName}-${uniqueSuffix}${path.extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: User,
    @UploadedFile() media?: Express.Multer.File,
  ) {
    return this.postService.createPost(createPostDto, user, media);
  }

  @Get('feed')
  async getFeed(
    @CurrentUser() user: { id?: string; userId?: string },
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    const id = user.id ?? user.userId;
    if (!id)
      throw new UnauthorizedException(
        'no user is found with that id for fecthing feed',
      );
    return this.postService.getFeed(id, limit, page);
  }

  @Get()
  getPostsCursor(
    @CurrentUser() user: User,
    @Query('limit') limit = '24',
    @Query('cursor') cursor?: string,
  ) {
    return this.postService.getPostsCursor(user.id, { limit: +limit, cursor });
  }

  @Post(':id/toggle-like')
  async toggleLike(@Param('id') postId: string, @CurrentUser() user: User) {
    return this.postService.toggleLike(postId, user);
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.postService.getPost(id);
    // console.log(id);

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
