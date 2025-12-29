import { RefreshToken } from 'src/auth/entity/refresh-token.entity';
import { DataSource, Repository } from 'typeorm';
export declare class RefreshTokenService {
    private readonly dataSource;
    private readonly repo;
    constructor(dataSource: DataSource, repo: Repository<RefreshToken>);
    create(userId: string, ttlMs: number): Promise<{
        jti: any;
        expiresAt: number;
    }>;
    findByJti(jti: string): Promise<RefreshToken | null>;
    revoke(jti: string): Promise<boolean>;
    revokeAllForUser(userId: string): Promise<void>;
    cleanupExpired(): Promise<void>;
    rotate(oldJti: string, userId: string, ttlMs: number): Promise<{
        newJti: any;
        expiresAt: number;
    }>;
}
