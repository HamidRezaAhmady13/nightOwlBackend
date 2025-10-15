import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
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
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
// import { CreateUserDto } from './dto/create-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const fullUser = await this.userService.getMe(user.id);

    res.cookie('theme', fullUser.settings?.theme || 'light', {
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
    const userId = req.user.id; // assuming you have auth middleware
    const updatedUser = await this.userService.updateTheme(userId, theme);
    console.log(userId, theme);
    res.cookie('theme', updatedUser.settings?.theme || 'light', {
      httpOnly: false,
      sameSite: 'lax',
    });
    return this.userService.updateTheme(userId, theme);
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
    return req.user;
  }

  @Get('search')
  async fullSearch(
    @Query('q') query: string,
    @Query('limit') limit = 20,
    @Query('page') page = 1,
  ) {
    console.log('Search query:', query, 'limit:', limit, 'page:', page);

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
    return this.userService.followUser(currentUser.id, username);
  }

  @Delete(':username/unfollow')
  unfollowUser(
    @Param('username') username: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.userService.unfollowUser(currentUser.id, username);
  }

  @Get(':username')
  getUser(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }
}
