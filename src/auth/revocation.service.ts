import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { RedisClientType } from 'redis';
// import { REDIS_CLIENT } from 'src/common/constants';
import { RedisService } from 'src/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class RevocationService {
  constructor(
    private readonly rtService: RefreshTokenService,
    // @Inject(REDIS_CLIENT) private readonly redis: RedisClientType,
    private readonly redis: RedisService,
  ) {}

  async set(jti: string, userId: string, ttlMs: number) {
    await this.redis.set(`refresh:${jti}`, String(userId), ttlMs / 1000);
  }

  async rotate(oldJti: string, userId: string, ttlMs: number) {
    const newJti = uuidv4();

    const lua = `
    if redis.call("GET", KEYS[1]) == ARGV[1]
    then
      redis.call("DEL", KEYS[1])
      redis.call("SET", KEYS[2], ARGV[1], "PX", ARGV[2])
      return 1
    else
      return 0
    end
  `;

    // keys: oldKey, newKey
    const ok = await this.redis.eval(lua, {
      keys: [`refresh:${oldJti}`, `refresh:${newJti}`],
      arguments: [String(userId), String(ttlMs)],
    });

    if (!ok)
      throw new UnauthorizedException('Refresh token revoked or replayed');
    return newJti;
  }

  async isRevoked(jti: string) {
    if (!jti) return false;
    const v = await this.redis.get(`refresh:${jti}`);
    // absent -> treat as revoked/invalid
    return !v;
  }

  async revokeAllForUser(userId: string) {
    return this.rtService.revokeAllForUser(userId);
  }

  async revokeJti(jti: string) {
    return this.rtService.revoke(jti);
  }
}
