import { RedisService } from 'src/redis/redis.service';
export declare class RevocationService {
    private readonly redis;
    constructor(redis: RedisService);
    set(jti: string, userId: string, ttlMs: number): Promise<void>;
    rotate(oldJti: string, userId: string, ttlMs: number): Promise<any>;
    isRevoked(jti: string): Promise<boolean>;
    revokeAllForUser(userId: string): Promise<void>;
    revokeJti(jti: string): Promise<void>;
}
