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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("@nestjs/typeorm");
const refresh_token_entity_1 = require("./entity/refresh-token.entity");
const revocation_service_1 = require("./revocation.service");
const lineLogger_1 = require("../common/utils/lineLogger");
const user_service_1 = require("../user/user.service");
let AuthService = class AuthService {
    userService;
    jwtService;
    revocation;
    dataSource;
    config;
    rtRepo;
    constructor(userService, jwtService, revocation, dataSource, config, rtRepo) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.revocation = revocation;
        this.dataSource = dataSource;
        this.config = config;
        this.rtRepo = rtRepo;
    }
    logger = new lineLogger_1.LineLogger('AuthService');
    async createTokens(userId) {
        const refreshJti = (0, uuid_1.v4)();
        const payload = { sub: userId, jti: refreshJti };
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('REFRESH_TTL_MS') || '30d',
        });
        const decoded = this.jwtService.decode(refresh_token);
        const now = Math.floor(Date.now() / 1000);
        const exp = decoded?.exp;
        const iat = decoded?.iat ?? now;
        const ttlMs = exp && iat ? (exp - iat) * 1000 : 30 * 24 * 3600 * 1000;
        await this.revocation.set(refreshJti, String(userId), ttlMs);
        const access_token = await this.jwtService.signAsync({ sub: userId }, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('ACCESS_TTL_MS') || '10s',
        });
        return { access_token, refresh_token, refreshJti, ttlMs };
    }
    async signUp(createUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const newUser = await this.userService.createUser({
            ...createUserDto,
            password: hashedPassword,
            provider: 'local',
        });
        return this.createTokens(newUser.id);
    }
    async signIn(email, password) {
        const user = await this.userService.findByEmailWithPassword(email);
        if (!user || !user.password)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!password || !user?.password)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.createTokens(user.id);
    }
    async handleProviderLogin(providerUser) {
        let user = await this.userService.findByEmail(providerUser.email);
        if (!user) {
            user = await this.userService.createUser({
                email: providerUser.email,
                password: null,
                provider: providerUser.provider || 'google',
                avatarUrl: providerUser.picture || null,
            });
        }
        return this.createTokens(user.id);
    }
    async verifyJwt(token) {
        this.logger.log('verifyJwt');
        const payload = await this.jwtService.verifyAsync(token).catch(() => null);
        if (!payload)
            return null;
        if (payload.jti && (await this.revocation.isRevoked(payload.jti)))
            return null;
        return payload;
    }
    async generateToken(userId, email) {
        const logger = new lineLogger_1.LineLogger('generateToken');
        const access_token = await this.jwtService.signAsync({ sub: userId, email }, { expiresIn: '15m' });
        return { access_token };
    }
    async refresh(refreshJwt) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshJwt, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('ACCESS_TOKEN_EXPIRED');
        }
        new lineLogger_1.LineLogger('refresh').log('payload', payload);
        const oldJti = payload.jti;
        const userId = payload.sub;
        if (!oldJti || !userId)
            throw new common_1.UnauthorizedException('Invalid token payload');
        const now = Math.floor(Date.now() / 1000);
        const exp = payload.exp;
        const ttlMs = exp && exp > now ? (exp - now) * 1000 : 30 * 24 * 3600 * 1000;
        let newJti;
        try {
            newJti = await this.revocation.rotate(oldJti, String(userId), ttlMs);
        }
        catch (err) {
            new lineLogger_1.LineLogger('refresh').error('Rotation failed, fallback to latest', err?.message ?? String(err));
            throw new common_1.UnauthorizedException('REFRESH_TOKEN_EXPIRED');
        }
        const access_token = await this.jwtService.signAsync({ sub: userId }, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: process.env.ACCESS_TTL || '10s',
        });
        const refresh_token = await this.jwtService.signAsync({ sub: userId, jti: newJti }, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: process.env.REFRESH_TTL || '30d',
        });
        return { access_token, refresh_token, refreshJti: newJti };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, typeorm_2.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        revocation_service_1.RevocationService,
        typeorm_1.DataSource,
        config_1.ConfigService,
        typeorm_1.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map