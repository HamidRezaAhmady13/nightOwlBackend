import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import * as Joi from 'joi';
import { AuthModule } from 'src/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { join } from 'path';

import { ChatGateway } from 'src/chatroom/chatroom.gateway';
import { ChatModule } from 'src/chatroom/chatroom.module';
import { ChatRoom } from 'src/chatroom/entity/chatroom.entity';
import { Message } from 'src/chatroom/entity/message.entity';
import { CommentModule } from 'src/comment/comment.module';
import { Comment } from 'src/comment/entity/comment.entity';
import { GreeterModule } from 'src/greeter/greeter.module';
import { Media } from 'src/post/entity/media.entity';
import { Post } from 'src/post/entity/posts.entity';
import { PostModule } from 'src/post/post.module';
import { User } from 'src/user/entity/user.entity';
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [
    AuthModule,
    GreeterModule,
    PostModule,
    UserModule,
    ChatModule,
    CommentModule,
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 600, // 10 minutes
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true, // makes it available everywhere
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, Media, Post, Comment, ChatRoom, Message],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
