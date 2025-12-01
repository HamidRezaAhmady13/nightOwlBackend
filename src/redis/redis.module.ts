import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';

import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST', '127.0.0.1');
        const port = config.get<number>('REDIS_PORT', 6379);
        const password = config.get<string | undefined>('REDIS_PASSWORD');

        return {
          store: redisStore,
          host,
          port,
          password,
          ttl: config.get<number>('CACHE_TTL', 600), // default TTL seconds
        } as any;
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
