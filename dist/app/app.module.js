"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const typeorm_1 = require("@nestjs/typeorm");
const Joi = require("joi");
const auth_module_1 = require("src/auth/auth.module");
const refresh_token_entity_1 = require("src/auth/entity/refresh-token.entity");
const comment_module_1 = require("src/comment/comment.module");
const comment_entity_1 = require("src/comment/entity/comment.entity");
const notification_entity_1 = require("src/notifications/entity/notification.entity");
const notification_module_1 = require("src/notifications/notification.module");
const media_entity_1 = require("src/post/entity/media.entity");
const posts_entity_1 = require("src/post/entity/posts.entity");
const post_module_1 = require("src/post/post.module");
const redis_module_1 = require("src/redis/redis.module");
const socket_module_1 = require("src/socket/socket.module");
const user_entity_1 = require("src/user/entity/user.entity");
const user_module_1 = require("src/user/user.module");
const app_controller_1 = require("src/app/app.controller");
const app_service_1 = require("src/app/app.service");
const request_logger_middleware_1 = require("src/common/middleware/request-logger.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_logger_middleware_1.RequestLoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            redis_module_1.RedisModule,
            post_module_1.PostModule,
            user_module_1.UserModule,
            socket_module_1.SocketModule,
            comment_module_1.CommentModule,
            notification_module_1.NotificationModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
                validationSchema: Joi.object({
                    NODE_ENV: Joi.string().valid('development', 'production').required(),
                    PORT: Joi.number().default(3000),
                    JWT_SECRET: Joi.string().required(),
                    JWT_REFRESH_SECRET: Joi.string().required(),
                    REDIS_URL: Joi.string().uri().optional(),
                    REDIS_HOST: Joi.when('REDIS_URL', {
                        is: Joi.exist(),
                        then: Joi.string().optional(),
                        otherwise: Joi.string().default('127.0.0.1'),
                    }),
                    REDIS_PORT: Joi.when('REDIS_URL', {
                        is: Joi.exist(),
                        then: Joi.number().optional(),
                        otherwise: Joi.number().default(6379),
                    }),
                    USER_CACHE_TTL: Joi.number().default(600),
                }),
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cs) => ({
                    type: 'postgres',
                    host: cs.get('DB_HOST'),
                    port: +cs.get('DB_PORT'),
                    username: cs.get('DB_USER'),
                    password: cs.get('DB_PASS'),
                    database: cs.get('DB_NAME'),
                    entities: [
                        user_entity_1.User,
                        posts_entity_1.Post,
                        comment_entity_1.Comment,
                        refresh_token_entity_1.RefreshToken,
                        media_entity_1.Media,
                        notification_entity_1.NotificationEntity,
                    ],
                    synchronize: true,
                    autoLoadEntities: true,
                }),
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: '/var/storage/uploads',
                serveRoot: '/uploads',
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map