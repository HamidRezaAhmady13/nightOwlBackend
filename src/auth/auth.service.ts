import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { InjectRepository } from '@nestjs/typeorm';
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
    @InjectRepository(RefreshToken) private rtRepo: Repository<RefreshToken>,
  ) {}

  private async createTokens(userId: string | number) {
    console.log('createTokens');

    const refreshJti = uuidv4();
    const ttlMs = Number(process.env.REFRESH_TTL_MS || 30 * 24 * 3600 * 1000);
    await this.revocation.set(refreshJti, String(userId), ttlMs);

    const access_token = await this.jwtService.signAsync(
      { sub: userId },
      { expiresIn: process.env.ACCESS_TTL || '10s' },
    );
    const refresh_token = await this.jwtService.signAsync(
      { sub: userId, jti: refreshJti },
      { expiresIn: process.env.REFRESH_TTL || '30d' },
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
    console.log('signIn');
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
    console.log('verifyJwt');
    const payload = await this.jwtService.verifyAsync(token).catch(() => null);
    if (!payload) return null;
    if (payload.jti && (await this.revocation.isRevoked(payload.jti)))
      return null;
    return payload;
  }

  public async generateToken(userId: string | number, email: string) {
    console.log('generateToken');
    const access_token = await this.jwtService.signAsync(
      { sub: userId, email },
      { expiresIn: '15m' },
    );
    return { access_token };
  }

  async refresh(refreshJwt: string) {
    console.log('refresh!!!!');
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshJwt, {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException(
        'Invalid refresh token by backend u need to log in again',
      );
    }
    const oldJti = payload.jti;
    const userId = payload.sub;
    if (!oldJti || !userId)
      throw new UnauthorizedException('Invalid token payload');
    const ttlMs = Number(process.env.REFRESH_TTL_MS || 30 * 24 * 3600 * 1000);
    const newJti = await this.revocation.rotate(oldJti, String(userId), ttlMs);
    const access_token = await this.jwtService.signAsync(
      { sub: userId },
      { expiresIn: process.env.ACCESS_TTL || '10s' },
    );
    const refresh_token = await this.jwtService.signAsync(
      { sub: userId, jti: newJti },
      { expiresIn: process.env.REFRESH_TTL || '30d' },
    );
    return { access_token, refresh_token };
  }
}
