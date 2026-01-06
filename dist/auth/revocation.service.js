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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevocationService = void 0;
const common_1 = require("@nestjs/common");
const lineLogger_1 = require("src/common/utils/lineLogger");
const redis_service_1 = require("src/redis/redis.service");
const uuid_1 = require("uuid");
let RevocationService = class RevocationService {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async set(jti, userId, ttlMs) {
        new lineLogger_1.LineLogger('revocation').log('log in revocation', `SET refresh:${jti} = ${userId} (${ttlMs}ms)`);
        await this.redis.psetex(`refresh:${jti}`, ttlMs, String(userId).trim());
    }
    async rotate(oldJti, userId, ttlMs) {
        const redisKey = `refresh:${oldJti}`;
        const redisValue = (await this.redis.get(redisKey)) ?? 'noRedisValue';
        new lineLogger_1.LineLogger('rotate').log('rotate check oldJti arg', oldJti);
        new lineLogger_1.LineLogger('rotate').log('rotate check redis value', redisValue);
        new lineLogger_1.LineLogger('rotate').log('rotate compare userId', userId);
        if (redisValue === 'noRedisValue') {
            new lineLogger_1.LineLogger('rotate').error('Redis value missing for oldJti (likely reused/expired refresh token)', oldJti);
            throw new common_1.UnauthorizedException('REFRESH_TOKEN_EXPIRED');
        }
        if (redisValue.trim() !== String(userId).trim()) {
            new lineLogger_1.LineLogger('rotate').error(`Redis value mismatch: redisValue="${redisValue}", userId="${userId}"`);
            throw new common_1.UnauthorizedException('REFRESH_TOKEN_EXPIRED');
        }
        const newJti = (0, uuid_1.v4)();
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
        new lineLogger_1.LineLogger('rotate').log('ok', ok);
        new lineLogger_1.LineLogger('rotate').log('value comparison', `${redisValue === userId} !---redis:${redisValue} !---userId: ${userId}`);
        new lineLogger_1.LineLogger('rotate').log(`ROTATED: oldJti=${oldJti}, newJti=${newJti}, userId=${userId}, ttlMs=${ttlMs}`);
        if (!ok) {
            new lineLogger_1.LineLogger('rotate').error('Lua script returned 0 (rotation failed)');
            throw new common_1.UnauthorizedException('REFRESH_TOKEN_EXPIRED');
        }
        return newJti;
    }
    async isRevoked(jti) {
        if (!jti)
            return false;
        const v = await this.redis.get(`refresh:${jti}`);
        return !v;
    }
    async revokeAllForUser(userId) {
    }
    async revokeJti(jti) {
        await this.redis.del(`refresh:${jti}`);
    }
};
exports.RevocationService = RevocationService;
exports.RevocationService = RevocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RevocationService);
//# sourceMappingURL=revocation.service.js.map