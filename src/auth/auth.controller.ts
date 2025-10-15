import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthenticatedRequest } from 'src/common/interfaces/user-request.interface';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
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
  async create(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const avatarUrl = avatar
      ? `/uploads/avatars/${avatar.filename}`
      : undefined;
    const token = await this.authService.signUp({
      ...createUserDto,
      avatarUrl,
    });

    res.cookie('jwt', token.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    return { message: 'Signup successful', token };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return { message: 'Logged out' };
  }

  @Post('signin')
  async signIn(
    @Body() { email, password }: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.signIn(email, password);
    console.log('signin authCTRL!!!!');
    console.log(token);

    res.cookie('jwt', token.access_token, {
      httpOnly: true,
      secure: false, // only over HTTPS
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    return { message: 'Logged in successfully', token };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: AuthenticatedRequest,
    @Res() // { passthrough: true }
    res: Response,
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('user not found!');

    // Use AuthService to generate JWT
    const token = this.authService.generateToken(user.id, user.email);

    // Return or redirect with token
    // return { token };
    res.cookie('jwt', token.access_token, {
      httpOnly: true,
      secure: false,
      // sameSite: 'strict',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });

    // res.redirect('http://localhost:3000/users/me');
    res.redirect(`http://localhost:3001/auth/callback?token=${token}`);
    // res.send('Cookie set. You are logged in!');
    // return { message: 'Google login successful' };
  }
}
