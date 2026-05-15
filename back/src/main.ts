import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import * as express from 'express';
import { AppModule } from 'src/app/app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  const configService = app.get(ConfigService);

  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
    }),
  );

  expressApp.use(express.json({ limit: '5mb' }));
  expressApp.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.enableCors({
    origin: [
      // 'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port, '0.0.0.0');
}

bootstrap();

// npx ts-node -r tsconfig-paths/register src/main.ts
// u1f409 dragon ,1F923 laughter ,🐯 Tiger: U+1F42F,🐦‍🔥 Phoenix: U+1F426 U+200D U+1F525 ⚔️ Crossed Swords: U+2694 + U+FE0F

// openssl rand -base64 32
//  Midcontract
