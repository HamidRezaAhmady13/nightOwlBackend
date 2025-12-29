"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtRefreshGuard = exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    static { JwtAuthGuard_1 = this; }
    static lastLog = new Map();
    async canActivate(context) {
        try {
            const req = context.switchToHttp().getRequest();
            const authHeader = req.headers?.authorization;
            const accessCookie = req.cookies?.access;
            const tokenVal = authHeader
                ? authHeader.replace(/^Bearer\s+/i, '')
                : accessCookie;
            if (tokenVal) {
                const prefix = tokenVal.slice(0, 10);
                const key = `tok:${prefix}`;
                const now = Date.now();
                const last = JwtAuthGuard_1.lastLog.get(key) ?? 0;
                if (now - last > 10_000) {
                    JwtAuthGuard_1.lastLog.set(key, now);
                }
            }
        }
        catch (e) { }
        return super.canActivate(context);
    }
    handleRequest(err, user, info) {
        const infoMsg = info ? (info.message ?? String(info)) : 'no-info';
        const key = infoMsg;
        const now = Date.now();
        const last = JwtAuthGuard_1.lastLog.get(key) ?? 0;
        if (!user) {
            let customMsg = infoMsg;
            if (infoMsg === 'jwt expired') {
                customMsg = 'ACCESS_TOKEN_EXPIRED';
            }
            else if (infoMsg === 'invalid signature') {
                customMsg = 'ACCESS_TOKEN_INVALID';
            }
            throw new common_1.UnauthorizedException(customMsg);
        }
        if (now - (JwtAuthGuard_1.lastLog.get('success') ?? 0) > 60_000) {
            JwtAuthGuard_1.lastLog.set('success', now);
        }
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
let JwtRefreshGuard = class JwtRefreshGuard extends (0, passport_1.AuthGuard)('jwt-refresh') {
    handleRequest(err, user, info) {
        if (!user) {
            if (info?.message === 'jwt expired') {
                throw new common_1.UnauthorizedException('REFRESH_TOKEN_EXPIRED');
            }
            if (info?.message === 'No auth token') {
                throw new common_1.UnauthorizedException('NO_REFRESH_TOKEN');
            }
            throw new common_1.UnauthorizedException('REFRESH_TOKEN_INVALID');
        }
        return user;
    }
};
exports.JwtRefreshGuard = JwtRefreshGuard;
exports.JwtRefreshGuard = JwtRefreshGuard = __decorate([
    (0, common_1.Injectable)()
], JwtRefreshGuard);
//# sourceMappingURL=jwt-auth.guard.js.map