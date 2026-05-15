import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LineLogger } from 'src/common/utils/lineLogger';
import { RefreshToken } from 'src/modules/auth/entity/refresh-token.entity';
import { RevocationService } from 'src/modules/auth/revocation.service';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { UserService } from 'src/modules/user/user.service';

interface JwtPayload {
  sub: string;
  jti?: string;
  email?: string;
  exp?: number;
  iat?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private revocation: RevocationService,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken) private rtRepo: Repository<RefreshToken>,
  ) {}
  logger = new LineLogger('AuthService');

  private async createTokens(userId: string | number) {
    const refreshJti = uuidv4();
    const refreshPayload: JwtPayload = {
      sub: String(userId),
      jti: refreshJti,
    } as const;

    const refresh_token = await this.jwtService.signAsync(
      refreshPayload as any,
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn:
          parseInt(this.config.get<string>('REFRESH_TTL_MS') || '2592000') /
          1000,
      },
    );

    const decoded: any = this.jwtService.decode(refresh_token);
    const now = Math.floor(Date.now() / 1000);
    const exp = decoded?.exp;
    const iat = decoded?.iat ?? now;
    const ttlMs = exp && iat ? (exp - iat) * 1000 : 30 * 24 * 3600 * 1000;

    await this.revocation.set(refreshJti, String(userId), ttlMs);

    const accessPayload: JwtPayload = {
      sub: String(userId),
      jti: refreshJti,
    };

    const access_token = await this.jwtService.signAsync(accessPayload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn:
        parseInt(this.config.get<string>('ACCESS_TTL_MS') || '600000') / 1000,
    });

    return { access_token, refresh_token, refreshJti, ttlMs };
  }

  async signUp(createUserDto: CreateUserDto): Promise<{
    access_token: string;
    refresh_token: string;
    refreshJti: string;
    ttlMs: number;
    username: string;
  }> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    let username = createUserDto.username;
    if (!username || username.trim() === '') {
      const prefix = createUserDto.email.split('@')[0];
      const random = Math.random().toString(36).substring(2, 8);
      username = `${prefix}_${random}`;
    }

    // const newUser = await this.userService.createUser({
    //   ...createUserDto,
    //   username,
    //   password: hashedPassword,
    //   provider: 'local',
    // });
    // // return this.createTokens(newUser.id);
    // return {
    //   ...(await this.createTokens(newUser.id)),
    //   username: newUser.username as string,
    // };

    try {
      const newUser = await this.userService.createUser({
        ...createUserDto,
        username,
        password: hashedPassword,
        provider: 'local',
      });
      return {
        ...(await this.createTokens(newUser.id)),
        username: newUser.username as string,
      };
    } catch (error: any) {
      // TypeORM throws QueryFailedError for unique violations (code 23505)
      if (error.code === '23505') {
        // The detail field contains the duplicated key
        if (error.detail?.includes('Key (username)=')) {
          throw new ConflictException('This username should be unique');
        } else if (error.detail?.includes('Key (email)=')) {
          throw new ConflictException(
            'An account with this email already exists.',
          );
        }
      }
      // re‑throw any other error
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');
    // const isMatch = await bcrypt.compare(password, user.password);

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!password || !user?.password)
      throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    return this.createTokens(user.id);
  }

  async handleProviderLogin(providerUser: any) {
    // providerUser should have id/email; upsert user if needed, return tokens
    let user = await this.userService.findByEmail(providerUser.email);
    if (!user) {
      user = await this.userService.createUser({
        email: providerUser.email,
        password: null,
        provider: providerUser.provider || 'google',
        avatarUrl: providerUser.picture || null,
      });
    }
    return this.createTokens(user.id);
  }

  async verifyJwt(token: string) {
    this.logger.log('verifyJwt');
    const payload = await this.jwtService.verifyAsync(token).catch(() => null);
    if (!payload) return null;
    if (payload.jti && (await this.revocation.isRevoked(payload.jti)))
      return null;
    return payload;
  }

  public async generateToken(userId: string | number, email: string) {
    const logger = new LineLogger('generateToken');
    const access_token = await this.jwtService.signAsync(
      { sub: userId, email },
      { expiresIn: '15m' },
    );
    return { access_token };
  }

  async refresh(refreshJwt: string) {
    let payload: any;

    try {
      payload = this.jwtService.verify(refreshJwt, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('ACCESS_TOKEN_EXPIRED');
    }
    new LineLogger('refresh').log('payload', payload);
    const oldJti = payload.jti;
    const userId = payload.sub;
    if (!oldJti || !userId)
      throw new UnauthorizedException('Invalid token payload');

    // Use exp from payload for TTL
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp;
    const ttlMs = exp && exp > now ? (exp - now) * 1000 : 30 * 24 * 3600 * 1000;

    // IMPORTANT: Only rotate if the oldJti exists in Redis
    // If not, try to fallback to the latest valid JTI for this user (optional)
    let newJti: string;
    try {
      newJti = await this.revocation.rotate(oldJti, String(userId), ttlMs);
    } catch (err) {
      // If rotation fails, check if the refresh token is already rotated and use the latest one
      // This fallback is optional and can be removed if strict rotation is required
      new LineLogger('refresh').error(
        'Rotation failed, fallback to latest',
        err?.message ?? String(err),
      );
      throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
    }

    const access_token = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn:
          parseInt(this.config.get<string>('ACCESS_TTL_MS') || '600000') / 1000,
      },
    );
    const refresh_token = await this.jwtService.signAsync(
      { sub: userId, jti: newJti },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn:
          parseInt(this.config.get<string>('REFRESH_TTL_MS') || '2592000') /
          1000,
      },
    );
    return { access_token, refresh_token, refreshJti: newJti };
  }
}
