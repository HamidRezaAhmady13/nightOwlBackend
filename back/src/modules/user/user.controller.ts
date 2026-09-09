import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { RedisService } from '@/core/redis/redis.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PostService } from '@/modules/post/post.service';
import { SafeUserDto } from '@/modules/user/dto/safe-user.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { User } from '@/modules/user/entity/user.entity';
import { UserService } from '@/modules/user/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';
import { extname } from 'path';
import { PostQueryService } from '../post/post-query.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly redis: RedisService,
    private readonly postQueryService: PostQueryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':username/follow')
  followUser(
    @Param('username') username: string,
    @CurrentUser() currentUser: User,
  ) {
    const decoded = decodeURIComponent(username);
    return this.userService.followUser(currentUser.id, decoded);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!user) throw new UnauthorizedException('Not authenticated');
    const userId =
      (user as any).id ?? (user as any).userId ?? (user as any).sub;
    if (!userId) throw new UnauthorizedException('Not authenticated');

    const cacheKey = `user:${userId}`;
    const cached = await this.redis.get(cacheKey);
    let fullUser: SafeUserDto;

    if (cached) {
      fullUser = JSON.parse(cached) as SafeUserDto;
    } else {
      fullUser = await this.userService.getMe(String(userId));
      await this.redis.set(cacheKey, JSON.stringify(fullUser), 60_000);
    }

    res.cookie('theme', fullUser?.settings?.theme || 'light', {
      httpOnly: false,
      sameSite: 'lax',
    });

    return fullUser;
  }

  @Get('search')
  async fullSearch(
    @Query('q') query: string,
    @Query('limit') limit = 20,
    @Query('page') page = 1,
  ) {
    return this.userService.searchUsers(query, Number(limit), Number(page));
  }

  @Get(':username/posts')
  async getPostsByUsername(
    @Param('username') username: string,
    @Query('limit') limit = '24',
    @Query('cursor') cursor?: string,
  ) {
    const decoded = decodeURIComponent(username);
    const user = await this.userService.findByUsername(decoded);
    if (!user) throw new NotFoundException('User not found');
    return this.postQueryService.getPostsCursor(user.id, {
      limit: +limit,
      cursor,
    });
  }

  @Get(':username')
  getUser(@Param('username') username: string) {
    const decoded = decodeURIComponent(username);

    return this.userService.findByUsername(decoded);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('theme')
  async updateTheme(
    @Req() req,
    @Body('theme') theme: 'light' | 'dark',
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Not authenticated');

    const updatedUser = await this.userService.updateTheme(userId, theme);
    res.cookie('theme', updatedUser.settings?.theme || 'light', {
      httpOnly: false,
      sameSite: 'lax',
    });

    return updatedUser;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const base = process.env.UPLOAD_PATH || './uploads';
          const avatarsPath = path.join(base, 'avatars');
          fs.mkdirSync(avatarsPath, { recursive: true });
          cb(null, avatarsPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  updateProfile(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() updateDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    const payload: Partial<UpdateUserDto> = { ...updateDto };

    if (avatar) {
      payload.avatarUrl = `/uploads/avatars/${avatar.filename}`;
    }

    return this.userService.updateUser(currentUser.id, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':username/unfollow')
  unfollowUser(
    @Param('username') username: string,
    @CurrentUser() currentUser: User,
  ) {
    const decoded = decodeURIComponent(username);
    return this.userService.unfollowUser(currentUser.id, decoded);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/avatar')
  async removeMyAvatar(@CurrentUser() currentUser: User) {
    // This calls the service method that wipes the file from disk AND clears the DB/Redis
    await this.userService.removeAvatar(currentUser.id);
    return { message: 'Avatar removed and file cleaned up successfully' };
  }
}
