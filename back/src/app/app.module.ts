import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';

import { RedisModule } from 'src/core/redis/redis.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { RefreshToken } from 'src/modules/auth/entity/refresh-token.entity';
import { CommentModule } from 'src/modules/comment/comment.module';
import { Comment } from 'src/modules/comment/entity/comment.entity';
import { NotificationEntity } from 'src/modules/notifications/entity/notification.entity';
import { NotificationModule } from 'src/modules/notifications/notification.module';
import { Media } from 'src/modules/post/entity/media.entity';
import { Post } from 'src/modules/post/entity/posts.entity';
import { PostModule } from 'src/modules/post/post.module';
import { SocketModule } from 'src/modules/socket/socket.module';
import { User } from 'src/modules/user/entity/user.entity';
import { UserModule } from 'src/modules/user/user.module';

import { join } from 'path';
import { AppController } from 'src/app/app.controller';
import { AppService } from 'src/app/app.service';
import { RequestLoggerMiddleware } from 'src/common/middleware/request-logger.middleware';

@Module({
  imports: [
    AuthModule,
    RedisModule,
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
      useFactory: (cs: ConfigService) =>
        ({
          type: 'postgres',
          host: cs.get('DB_HOST'),
          port: +cs.get('DB_PORT'),
          username: cs.get('DB_USER'),
          password: cs.get('DB_PASSWORD'),
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
        }) as TypeOrmModuleOptions,
    }),
    ServeStaticModule.forRoot({
      // rootPath: '/var/storage/uploads',
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
