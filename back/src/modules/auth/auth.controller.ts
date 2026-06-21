import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { DEFAULT_REFRESH_MS } from 'src/common/constants';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthenticatedRequest } from 'src/common/interfaces/user-request.interface';
import { LineLogger } from 'src/common/utils/lineLogger';
import { AuthService } from 'src/modules/auth/auth.service';
import {
  JwtAuthGuard,
  JwtRefreshGuard,
} from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { User } from '../user/entity/user.entity';

@Controller('auth')
export class AuthController {
  private readonly refreshTtlMs: number;

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {
    this.refreshTtlMs = this.config.get<number>(
      'REFRESH_TTL_MS',
      DEFAULT_REFRESH_MS,
    );
  }

  private cookieOptions(httpOnly: boolean, maxAge?: number) {
    const secure = this.config.get<string>('COOKIE_SECURE', 'false') === 'true';
    const sameSite = secure ? ('none' as const) : ('lax' as const);
    const domain = this.config.get<string>('COOKIE_DOMAIN') || undefined;
    const opts: any = {
      httpOnly,
      secure,
      sameSite,
      path: '/',
      domain,
    };
    if (typeof maxAge === 'number') opts.maxAge = maxAge;
    return opts;
  }

  @Post('signup')
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, username } =
      await this.authService.signUp({
        ...createUserDto,
      });

    res.cookie(
      'refresh',
      refresh_token,
      this.cookieOptions(true, this.refreshTtlMs),
    );
    return { access_token, username };
  }

  @Post('signin')
  async signIn(
    @Body() { email, password }: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    new LineLogger.log('signin', 'signin');
    const { access_token, refresh_token } = await this.authService.signIn(
      email,
      password,
    );

    res.cookie(
      'refresh',
      refresh_token,
      this.cookieOptions(true, this.refreshTtlMs),
    );
    res.cookie(
      'access',
      access_token,
      this.cookieOptions(false, 15 * 60 * 1000),
    );
    return { access_token };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshJwt = req.cookies?.refresh;
    if (!refreshJwt) throw new UnauthorizedException('No refresh token');
    const { access_token, refresh_token, refreshJti } =
      await this.authService.refresh(refreshJwt);

    res.cookie(
      'refresh',
      refresh_token,
      this.cookieOptions(true, this.refreshTtlMs),
    );
    // Set new access token cookie for the client
    res.cookie(
      'access',
      access_token,
      this.cookieOptions(true, 15 * 60 * 1000), // 15 minutes
    );
    return { access_token, refreshJti };
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
        message: (err as any)?.message ?? err,
      });
      throw new UnauthorizedException('failed to process provider login');
    }

    const { access_token, refresh_token } = tokens;

    res.cookie(
      'refresh',
      refresh_token,
      this.cookieOptions(true, this.refreshTtlMs),
    );

    const redirectBase = this.config.get<string>(
      'CLIENT_OAUTH_REDIRECT',
      'http://localhost:3001/auth/callback',
    );
    const redirectUrl = `${redirectBase}?access=${encodeURIComponent(access_token)}`;

    return res.redirect(redirectUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: User,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.changePassword(user.id, oldPassword, newPassword);
    return { message: 'Password changed successfully' };
  }
}
// hamidraven123456@gmail.com
