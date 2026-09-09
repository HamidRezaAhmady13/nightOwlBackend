import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '@/modules/auth/guards/jwt-auth.guard';
import { CreatePostDto } from '@/modules/post/dto/create-post.dto';
import { PostService } from '@/modules/post/post.service';
import { User } from '@/modules/user/entity/user.entity';
import { PostQueryService } from './post-query.service';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postQueryService: PostQueryService,
  ) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post(':id/toggle-like')
  async toggleLike(@Param('id') postId: string, @CurrentUser() user: User) {
    return this.postService.toggleLike(postId, user);
  }

  @Get('feed')
  @UseGuards(OptionalJwtAuthGuard)
  async getFeed(
    @CurrentUser() user: { id?: string; userId?: string },
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    const id = user?.id ?? user?.userId;
    if (id) {
      return this.postQueryService.getFeed(id, limit, page);
    }
    return this.postQueryService.getPublicFeed(limit, page);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getPostsCursor(
    @CurrentUser() user: User,
    @Query('limit') limit = '24',
    @Query('cursor') cursor?: string,
  ) {
    return this.postQueryService.getPostsCursor(user.id, {
      limit: +limit,
      cursor,
    });
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.postQueryService.getPost(id);

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updatePost(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser() user: User,
  ) {
    return this.postService.updatePost(id, { content }, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePostById(@Param('id') id: string, @CurrentUser() user: User) {
    await this.postService.deletePost(id, user.id);
  }
}
