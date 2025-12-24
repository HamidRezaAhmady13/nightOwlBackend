import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { join } from 'path';

import { AuthModule } from 'src/auth/auth.module';
import { RefreshToken } from 'src/auth/entity/refresh-token.entity';
import { CommentModule } from 'src/comment/comment.module';
import { Comment } from 'src/comment/entity/comment.entity';
import { GreeterModule } from 'src/greeter/greeter.module';
import { NotificationEntity } from 'src/notifications/entity/notification.entity';
import { NotificationModule } from 'src/notifications/notification.module';
import { Media } from 'src/post/entity/media.entity';
import { Post } from 'src/post/entity/posts.entity';
import { PostModule } from 'src/post/post.module';
import { RedisModule } from 'src/redis/redis.module';
import { SocketModule } from 'src/socket/socket.module';
import { User } from 'src/user/entity/user.entity';
import { UserModule } from 'src/user/user.module';

import { RequestLoggerMiddleware } from 'src/common/middleware/request-logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AuthModule,
    RedisModule,
    GreeterModule,
    PostModule,
    UserModule,
    SocketModule,
    CommentModule,
    NotificationModule,
    ConfigModule.forRoot({
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        type: 'postgres',
        host: cs.get('DB_HOST'),
        port: +cs.get('DB_PORT'),
        username: cs.get('DB_USER'),
        password: cs.get('DB_PASS'),
        database: cs.get('DB_NAME'),
        entities: [
          User,
          Post,
          Comment,
          RefreshToken,
          Media,
          NotificationEntity,
        ],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
