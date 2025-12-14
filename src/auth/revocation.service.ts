import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LineLogger } from 'src/common/utils/lineLogger';
import { RedisService } from 'src/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RevocationService {
  constructor(private readonly redis: RedisService) {}

  async set(jti: string, userId: string, ttlMs: number) {
    // Set Redis key for this JTI, log for debug
    new LineLogger('revocation').log(
      'log in revocation',
      `SET refresh:${jti} = ${userId} (${ttlMs}ms)`,
    );
    await this.redis.psetex(`refresh:${jti}`, ttlMs, String(userId).trim());
  }

  async rotate(oldJti: string, userId: string, ttlMs: number) {
    const redisKey = `refresh:${oldJti}`;
    const redisValue = (await this.redis.get(redisKey)) ?? 'noRedisValue';

    new LineLogger('rotate').log('rotate check oldJti arg', oldJti);
    new LineLogger('rotate').log('rotate check redis value', redisValue);
    new LineLogger('rotate').log('rotate compare userId', userId);

    // Extra debug: list all refresh:* keys
    // const allKeys = await this.redis.client.keys('refresh:*');
    // new LineLogger('rotate').log('ALL refresh:* keys', JSON.stringify(allKeys));

    // Safety checks
    if (redisValue === 'noRedisValue') {
      new LineLogger('rotate').error(
        'Redis value missing for oldJti (likely reused/expired refresh token)',
        oldJti,
      );
      throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
    }
    if (redisValue.trim() !== String(userId).trim()) {
      new LineLogger('rotate').error(
        `Redis value mismatch: redisValue="${redisValue}", userId="${userId}"`,
      );
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

    new LineLogger('rotate').log('ok', ok);

    new LineLogger('rotate').log(
      'value comparison',
      `${redisValue === userId} !---redis:${redisValue} !---userId: ${userId}`,
    );

    new LineLogger('rotate').log(
      `ROTATED: oldJti=${oldJti}, newJti=${newJti}, userId=${userId}, ttlMs=${ttlMs}`,
    );

    if (!ok) {
      new LineLogger('rotate').error('Lua script returned 0 (rotation failed)');
      throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
    }

    return newJti;
  }

  // async rotate(oldJti: string, userId: string, ttlMs: number) {
  //   new LineLogger('rotate').log('rotate check oldJti as arg', oldJti);

  //   // Always check the correct Redis key for the old JTI
  //   const redisKey = `refresh:${oldJti}`;
  //   const redisValue = (await this.redis.get(redisKey)) ?? 'noRedisValue';
  //   new LineLogger('rotate').log('rotate check oldJti from redis', redisValue);
  //   new LineLogger('rotate').log('rotate compare userId', userId);

  //   // Extra debug: list all refresh:* keys
  //   const allKeys = await this.redis.client.keys('refresh:*');
  //   new LineLogger('rotate').log('ALL refresh:* keys', JSON.stringify(allKeys));

  //   if (redisValue === 'noRedisValue') {
  //     new LineLogger('rotate').error(
  //       'Redis value missing for oldJti (likely reused/old refresh token)',
  //       oldJti,
  //     );
  //     throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
  //   }
  //   if (redisValue.trim() !== String(userId).trim()) {
  //     new LineLogger('rotate').error(
  //       `Redis value and userId mismatch: redisValue="${redisValue}", userId="${userId}"`,
  //     );
  //     throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
  //   }

  //   const newJti = uuidv4();

  //   // Atomically set new JTI and delete old JTI
  //   const lua = `
  //     redis.call("psetex", KEYS[2], ARGV[2], ARGV[1])
  //     redis.call("del", KEYS[1])
  //     return 1
  //   `;
  //   const ok = await this.redis.eval(lua, {
  //     keys: [redisKey, `refresh:${newJti}`],
  //     arguments: [String(userId).trim(), String(ttlMs)],
  //   });

  //   new LineLogger('rotate').log(
  //     `ROTATED: oldJti=${oldJti}, newJti=${newJti}, userId=${userId}, ttlMs=${ttlMs}`,
  //   );

  //   if (!ok) throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED');
  //   return newJti;
  // }

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
