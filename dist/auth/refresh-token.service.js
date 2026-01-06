"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const refresh_token_entity_1 = require("src/auth/entity/refresh-token.entity");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
let RefreshTokenService = class RefreshTokenService {
    dataSource;
    repo;
    constructor(dataSource, repo) {
        this.dataSource = dataSource;
        this.repo = repo;
    }
    async create(userId, ttlMs) {
        const jti = (0, uuid_1.v4)();
        const row = this.repo.create({
            userId: String(userId),
            jti,
            expiresAt: Date.now() + ttlMs,
            revoked: false,
        });
        await this.repo.save(row);
        return { jti, expiresAt: row.expiresAt };
    }
    async findByJti(jti) {
        return this.repo.findOne({ where: { jti } });
    }
    async revoke(jti) {
        const existing = await this.repo.findOne({ where: { jti } });
        if (!existing)
            return false;
        existing.revoked = true;
        await this.repo.save(existing);
        return true;
    }
    async revokeAllForUser(userId) {
        await this.repo.update({ userId: String(userId), revoked: false }, { revoked: true });
    }
    async cleanupExpired() {
        const now = Date.now();
        await this.repo
            .createQueryBuilder()
            .delete()
            .from(refresh_token_entity_1.RefreshToken)
            .where('expiresAt < :now', { now })
            .execute();
    }
    async rotate(oldJti, userId, ttlMs) {
        return this.dataSource.transaction(async (manager) => {
            const txRepo = manager.getRepository(refresh_token_entity_1.RefreshToken);
            const now = Date.now();
            const existing = await txRepo.findOne({ where: { jti: oldJti } });
            if (!existing || existing.revoked || Number(existing.expiresAt) < now) {
                throw new Error('invalid_or_revoked');
            }
            existing.revoked = true;
            await txRepo.save(existing);
            const newJti = (0, uuid_1.v4)();
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
};
exports.RefreshTokenService = RefreshTokenService;
exports.RefreshTokenService = RefreshTokenService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository])
], RefreshTokenService);
//# sourceMappingURL=refresh-token.service.js.map