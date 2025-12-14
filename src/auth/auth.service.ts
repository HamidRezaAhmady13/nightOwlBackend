import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LineLogger } from 'src/common/utils/lineLogger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { RefreshToken } from './entity/refresh-token.entity';
import { RevocationService } from './revocation.service';

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
    const payload = { sub: userId, jti: refreshJti };

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('REFRESH_TTL_MS') || '30d',
    });

    // Decode the JWT to get exp/iat
    const decoded: any = this.jwtService.decode(refresh_token);
    const now = Math.floor(Date.now() / 1000);
    const exp = decoded?.exp;
    const iat = decoded?.iat ?? now;
    const ttlMs = exp && iat ? (exp - iat) * 1000 : 30 * 24 * 3600 * 1000;

    await this.revocation.set(refreshJti, String(userId), ttlMs);

    const access_token = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('ACCESS_TTL_MS') || '10s',
      },
    );

    return { access_token, refresh_token, refreshJti, ttlMs };
  }

  async signUp(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.userService.createUser({
      ...createUserDto,
      password: hashedPassword,
      provider: 'local',
    });
    return this.createTokens(newUser.id);
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
        expiresIn: process.env.ACCESS_TTL || '10s',
      },
    );
    const refresh_token = await this.jwtService.signAsync(
      { sub: userId, jti: newJti },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: process.env.REFRESH_TTL || '30d',
      },
    );
    return { access_token, refresh_token, refreshJti: newJti };
  }
}
