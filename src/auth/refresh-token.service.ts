import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from './entity/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
  ) {}

  async create(userId: string, ttlMs: number) {
    const jti = uuidv4();
    const row = this.repo.create({
      userId: String(userId),
      jti,
      expiresAt: Date.now() + ttlMs,
      revoked: false,
    });
    await this.repo.save(row);
    return { jti, expiresAt: row.expiresAt };
  }

  async findByJti(jti: string) {
    return this.repo.findOne({ where: { jti } });
  }

  async revoke(jti: string) {
    const existing = await this.repo.findOne({ where: { jti } });
    if (!existing) return false;
    existing.revoked = true;
    await this.repo.save(existing);
    return true;
  }

  async revokeAllForUser(userId: string) {
    await this.repo.update(
      { userId: String(userId), revoked: false },
      { revoked: true },
    );
  }

  async cleanupExpired() {
    const now = Date.now();
    await this.repo
      .createQueryBuilder()
      .delete()
      .from(RefreshToken)
      .where('expiresAt < :now', { now })
      .execute();
  }

  // Atomic rotate: verify oldJti exists & not revoked/expired, revoke it, insert new jti
  async rotate(oldJti: string, userId: string, ttlMs: number) {
    return this.dataSource.transaction(async (manager) => {
      const txRepo = manager.getRepository(RefreshToken);
      const now = Date.now();

      const existing = await txRepo.findOne({ where: { jti: oldJti } });
      if (!existing || existing.revoked || Number(existing.expiresAt) < now) {
        throw new Error('invalid_or_revoked'); // caller maps to UnauthorizedException
      }

      existing.revoked = true;
      await txRepo.save(existing);

      const newJti = uuidv4();
      const newRow = txRepo.create({
        jti: newJti,
        userId: String(userId),
        expiresAt: now + ttlMs,
        revoked: false,
      });
      await txRepo.save(newRow);

      return { newJti, expiresAt: newRow.expiresAt };
    });
  }
}
