import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule as LocalRedisModule } from 'src/redis/redis.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './entity/refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { RevocationService } from './revocation.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),

    ConfigModule,
    LocalRedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (cs: ConfigService) => ({
        secret: cs.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '10h' },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => {
        const host = cs.get<string>('REDIS_HOST', '127.0.0.1');
        const port = cs.get<string>('REDIS_PORT', '6379');
        const password = cs.get<string>('REDIS_PASSWORD');
        const url = password
          ? `redis://:${password}@${host}:${port}`
          : `redis://${host}:${port}`;
        return { type: 'single', url }; // RedisModuleOptions expected by @nestjs-modules/ioredis
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
    RevocationService,
    RefreshTokenService,
  ],
  exports: [AuthService, RevocationService, RefreshTokenService],
})
export class AuthModule {}
