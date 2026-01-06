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
exports.GoogleStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const auth_service_1 = require("src/auth/auth.service");
const user_service_1 = require("src/user/user.service");
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    configService;
    userService;
    authService;
    constructor(configService, userService, authService) {
        const clientID = configService.get('CLIENT_ID');
        const clientSecret = configService.get('CLIENT_SECRET');
        if (!clientID || !clientSecret)
            throw new Error('clientID or clientSecret  or both are missing!');
        super({
            clientID,
            clientSecret,
            callbackURL: 'http://localhost:3000/auth/google/callback',
            scope: ['openid', 'profile', 'email'],
        });
        this.configService = configService;
        this.userService = userService;
        this.authService = authService;
    }
    async validate(accessToken, refreshToken, profile) {
        let email = profile.emails?.[0]?.value;
        if (!email && profile._json && profile._json.email) {
            email = profile._json.email;
        }
        if (!email) {
            console.warn(`GoogleStrategy: email missing for profile id=${profile.id}, proceeding with synthetic email`);
            email = `${profile.id}@google.local`;
        }
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser)
            return existingUser;
        const { name, photos } = profile;
        const createUserDto = {
            username: email.split('@')[0],
            email,
            password: Math.random().toString(36).slice(-8),
            avatarUrl: photos?.[0]?.value,
            bio: `${name?.givenName ?? ''} ${name?.familyName ?? ''}`.trim() +
                ' via Google',
        };
        const newUser = await this.userService.createUser({
            ...createUserDto,
            password: '',
            provider: 'google',
        });
        return newUser;
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => auth_service_1.AuthService))),
    __metadata("design:paramtypes", [config_1.ConfigService,
        user_service_1.UserService,
        auth_service_1.AuthService])
], GoogleStrategy);
//# sourceMappingURL=google.strategy.js.map