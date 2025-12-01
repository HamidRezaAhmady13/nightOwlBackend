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
import { DEFAULT_REFRESH_MS } from 'src/common/constants';
import { AuthenticatedRequest } from 'src/common/interfaces/user-request.interface';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private cookieOptions(httpOnly: boolean, maxAge?: number) {
    const secure = process.env.COOKIE_SECURE === 'true';
    const sameSite = secure ? ('none' as const) : ('lax' as const);
    const opts: any = {
      httpOnly,
      secure,
      sameSite,
      path: '/',
    };
    if (typeof maxAge === 'number') opts.maxAge = maxAge;
    return opts;
  }

  @Post('signup')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) =>
          cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`,
          ),
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
    const { access_token, refresh_token } = await this.authService.signUp({
      ...createUserDto,
      avatarUrl,
    });
    const raw = process.env.REFRESH_TTL_MS;
    const refreshTtlMs =
      raw && /^\d+$/.test(raw) ? parseInt(raw, 10) : DEFAULT_REFRESH_MS;
    res.cookie(
      'refresh',
      refresh_token,
      this.cookieOptions(true, refreshTtlMs),
    );
    return { access_token };
  }

  @Post('signin')
  async signIn(
    @Body() { email, password }: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.signIn(
      email,
      password,
    );
    const raw = process.env.REFRESH_TTL_MS;
    const refreshTtlMs =
      raw && /^\d+$/.test(raw) ? parseInt(raw, 10) : DEFAULT_REFRESH_MS;

    res.cookie(
      'refresh',
      refresh_token,
      this.cookieOptions(true, refreshTtlMs),
    );
    return { access_token };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshJwt = req.cookies?.refresh;
    if (!refreshJwt) throw new UnauthorizedException('No refresh token');
    const { access_token, refresh_token } =
      await this.authService.refresh(refreshJwt);
    const raw = process.env.REFRESH_TTL_MS;
    const refreshTtlMs =
      raw && /^\d+$/.test(raw) ? parseInt(raw, 10) : DEFAULT_REFRESH_MS;

    res.cookie(
      'refresh',
      refresh_token,
      this.cookieOptions(true, refreshTtlMs),
    );
    return { access_token };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh', { path: '/' });
    return { message: 'Logged out' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const user = req.user;

    if (!user) {
      console.warn('googleAuthRedirect: no user on request', {
        query: req.query,
      });
      throw new UnauthorizedException('user not found from provider');
    }

    let tokens;
    try {
      tokens = await this.authService.handleProviderLogin(user);
    } catch (err) {
      console.error('googleAuthRedirect: handleProviderLogin failed', {
        message: err?.message ?? err,
      });
      throw new UnauthorizedException('failed to process provider login');
    }

    const { access_token, refresh_token } = tokens;

    const raw = process.env.REFRESH_TTL_MS;
    const refreshTtlMs =
      raw && /^\d+$/.test(raw) ? parseInt(raw, 10) : DEFAULT_REFRESH_MS;

    res.cookie(
      'refresh',
      refresh_token,
      this.cookieOptions(true, refreshTtlMs),
    );
    const redirectBase =
      process.env.CLIENT_OAUTH_REDIRECT ||
      'http://localhost:3001/auth/callback';
    const redirectUrl = `${redirectBase}?access=${encodeURIComponent(access_token)}`;

    return res.redirect(redirectUrl);
  }
}
