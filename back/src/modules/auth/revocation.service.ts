import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from 'src/core/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RevocationService {
  constructor(private readonly redis: RedisService) {}

  async set(jti: string, userId: string, ttlMs: number) {
    await this.redis.psetex(`refresh:${jti}`, ttlMs, String(userId).trim());
  }

  async rotate(oldJti: string, userId: string, ttlMs: number) {
    const redisKey = `refresh:${oldJti}`;
    const redisValue = (await this.redis.get(redisKey)) ?? 'noRedisValue';

    if (redisValue === 'noRedisValue') {
      throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
    }
    if (redisValue.trim() !== String(userId).trim()) {
      throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
    }

    const newJti = uuidv4();

    // Atomic Lua: only rotate if value matches userId
    const lua = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      redis.call("DEL", KEYS[1])
      redis.call("PSETEX", KEYS[2], ARGV[2], ARGV[1])
      return 1
    else
      return 0
    end
  `;

    const ok = await this.redis.eval(lua, {
      keys: [redisKey, `refresh:${newJti}`],
      arguments: [String(userId).trim(), String(ttlMs)],
    });

    if (!ok) {
      throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
    }

    return newJti;
  }

  async isRevoked(jti: string) {
    if (!jti) return false;
    const v = await this.redis.get(`refresh:${jti}`);
    return !v;
  }

  async revokeAllForUser(userId: string) {
    // No-op for Redis-only implementation
  }

  async revokeJti(jti: string) {
    await this.redis.del(`refresh:${jti}`);
  }
}
