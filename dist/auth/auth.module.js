"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const ioredis_1 = require("@nestjs-modules/ioredis");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const refresh_token_entity_1 = require("./entity/refresh-token.entity");
const refresh_token_service_1 = require("./refresh-token.service");
const revocation_service_1 = require("./revocation.service");
const google_strategy_1 = require("./strategies/google.strategy");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const jwtRefreshStrategy_1 = require("./strategies/jwtRefreshStrategy");
const redis_module_1 = require("../redis/redis.module");
const user_module_1 = require("../user/user.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            user_module_1.UserModule,
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([refresh_token_entity_1.RefreshToken]),
            redis_module_1.RedisModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (cs) => ({
                    secret: cs.get('JWT_SECRET'),
                    signOptions: { expiresIn: '10h' },
                }),
            }),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            ioredis_1.RedisModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cs) => {
                    const host = cs.get('REDIS_HOST', '127.0.0.1');
                    const port = cs.get('REDIS_PORT', '6379');
                    const password = cs.get('REDIS_PASSWORD');
                    const url = password
                        ? `redis://:${password}@${host}:${port}`
                        : `redis://${host}:${port}`;
                    return { type: 'single', url };
                },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            google_strategy_1.GoogleStrategy,
            jwt_strategy_1.JwtStrategy,
            revocation_service_1.RevocationService,
            refresh_token_service_1.RefreshTokenService,
            jwtRefreshStrategy_1.JwtRefreshStrategy,
        ],
        exports: [auth_service_1.AuthService, revocation_service_1.RevocationService, refresh_token_service_1.RefreshTokenService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map