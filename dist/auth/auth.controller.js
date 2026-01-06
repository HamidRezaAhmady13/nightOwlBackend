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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const auth_service_1 = require("src/auth/auth.service");
const jwt_auth_guard_1 = require("src/auth/guards/jwt-auth.guard");
const constants_1 = require("src/common/constants");
const create_user_dto_1 = require("src/user/dto/create-user.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    cookieOptions(httpOnly, maxAge) {
        const secure = process.env.COOKIE_SECURE === 'true';
        const sameSite = secure ? 'none' : 'lax';
        const opts = {
            httpOnly,
            secure,
            sameSite,
            path: '/',
        };
        if (typeof maxAge === 'number')
            opts.maxAge = maxAge;
        return opts;
    }
    async create(avatar, createUserDto, res) {
        const avatarUrl = avatar
            ? `/uploads/avatars/${avatar.filename}`
            : undefined;
        const { access_token, refresh_token } = await this.authService.signUp({
            ...createUserDto,
            avatarUrl,
        });
        const raw = process.env.REFRESH_TTL_MS ?? '';
        const refreshTtlMs = /^\d+$/.test(raw) ? Number(raw) : constants_1.DEFAULT_REFRESH_MS;
        res.cookie('refresh', refresh_token, this.cookieOptions(true, refreshTtlMs));
        return { access_token };
    }
    async signIn({ email, password }, res) {
        const { access_token, refresh_token } = await this.authService.signIn(email, password);
        const raw = process.env.REFRESH_TTL_MS ?? '';
        const refreshTtlMs = /^\d+$/.test(raw) ? Number(raw) : constants_1.DEFAULT_REFRESH_MS;
        res.cookie('refresh', refresh_token, this.cookieOptions(true, refreshTtlMs));
        return { access_token };
    }
    async refresh(req, res) {
        const refreshJwt = req.cookies?.refresh;
        if (!refreshJwt)
            throw new common_1.UnauthorizedException('No refresh token');
        const { access_token, refresh_token, refreshJti } = await this.authService.refresh(refreshJwt);
        const raw = process.env.REFRESH_TTL_MS ?? '';
        const refreshTtlMs = /^\d+$/.test(raw) ? Number(raw) : constants_1.DEFAULT_REFRESH_MS;
        res.cookie('refresh', refresh_token, this.cookieOptions(true, refreshTtlMs));
        res.cookie('access', access_token, this.cookieOptions(true, 15 * 60 * 1000));
        return { access_token, refreshJti };
    }
    logout(res) {
        res.clearCookie('refresh', { path: '/' });
        return { message: 'Logged out' };
    }
    async googleAuth() { }
    async googleAuthRedirect(req, res) {
        const user = req.user;
        if (!user) {
            console.warn('googleAuthRedirect: no user on request', {
                query: req.query,
            });
            throw new common_1.UnauthorizedException('user not found from provider');
        }
        let tokens;
        try {
            tokens = await this.authService.handleProviderLogin(user);
        }
        catch (err) {
            console.error('googleAuthRedirect: handleProviderLogin failed', {
                message: err?.message ?? err,
            });
            throw new common_1.UnauthorizedException('failed to process provider login');
        }
        const { access_token, refresh_token } = tokens;
        const raw = process.env.REFRESH_TTL_MS ?? '';
        const refreshTtlMs = /^\d+$/.test(raw) ? Number(raw) : constants_1.DEFAULT_REFRESH_MS;
        res.cookie('refresh', refresh_token, this.cookieOptions(true, refreshTtlMs));
        const redirectBase = process.env.CLIENT_OAUTH_REDIRECT ||
            'http://localhost:3001/auth/callback';
        const redirectUrl = `${redirectBase}?access=${encodeURIComponent(access_token)}`;
        return res.redirect(redirectUrl);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', {
        storage: (0, multer_1.diskStorage)({
            destination: '/var/storage/uploads/avatars',
            filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${(0, path_1.extname)(file.originalname)}`),
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('signin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtRefreshGuard),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthRedirect", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map