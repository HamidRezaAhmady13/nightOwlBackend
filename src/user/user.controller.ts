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
import { Request, Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PostService } from 'src/post/post.service';
import { RedisService } from 'src/redis/redis.service';
import { SafeUserDto } from './dto/safe-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly redis: RedisService,
  ) {}

  @Get('me')
  async getMe(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!user) throw new UnauthorizedException('Not authenticated');
    const userId =
      (user as any).id ?? (user as any).userId ?? (user as any).sub;
    if (!userId) throw new UnauthorizedException('Not authenticated');

    // 1. Try cache first
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

  @Patch('me')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
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
    const avatarUrl = avatar
      ? `/uploads/avatars/${avatar.filename}`
      : undefined;

    const sanitizedDto = Object.fromEntries(
      Object.entries(updateDto).filter(
        ([_, value]) => value !== '' && value !== null && value !== undefined,
      ),
    );

    const payload: Partial<UpdateUserDto> = {
      ...sanitizedDto,
      ...(avatarUrl && { avatarUrl }),
    };

    return this.userService.updateUser(currentUser.id, payload);
  }

  @Get('profile')
  getProfile(@Req() req: Request) {
    if (!req.user) throw new UnauthorizedException('Not authenticated');
    return req.user;
  }

  @Get('search')
  async fullSearch(
    @Query('q') query: string,
    @Query('limit') limit = 20,
    @Query('page') page = 1,
  ) {
    return this.userService.searchUsers(query, Number(limit), Number(page));
  }

  @Delete('/delete-avatar/:id/avatar')
  async deleteAvatar(
    @Param('id') userId: string,
    @Req() req: Request, // optional auth
  ) {
    // Optionally verify req.user.id === userId
    await this.userService.removeAvatar(userId);
    return { message: 'Avatar removed' };
  }

  @Post(':username/follow')
  followUser(
    @Param('username') username: string,
    @CurrentUser() currentUser: User,
  ) {
    const decoded = decodeURIComponent(username);
    return this.userService.followUser(currentUser.id, decoded);
  }

  @Delete(':username/unfollow')
  unfollowUser(
    @Param('username') username: string,
    @CurrentUser() currentUser: User,
  ) {
    const decoded = decodeURIComponent(username);
    return this.userService.unfollowUser(currentUser.id, decoded);
  }

  @Get(':username/posts')
  async getPostsByUsername(
    @Param('username') username: string,
    @Query('limit') limit = '24',
    @Query('cursor') cursor?: string,
  ) {
    // service should find the user by username, then get posts for that user's id
    const decoded = decodeURIComponent(username);
    const user = await this.userService.findByUsername(decoded);
    if (!user) throw new NotFoundException('User not found');
    return this.postService.getPostsCursor(user.id, { limit: +limit, cursor });
  }

  @Get(':username')
  getUser(@Param('username') username: string) {
    const decoded = decodeURIComponent(username);

    return this.userService.findByUsername(decoded);
  }
}
