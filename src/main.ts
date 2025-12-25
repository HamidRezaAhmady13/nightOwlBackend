import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './http-exception/http-exception.filter';

import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip any unexpected props
      forbidNonWhitelisted: true, // 400 on extra props
      transform: true, // coerce & run @Transform()
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
    }),
  );

  expressApp.use(express.json({ limit: '140mb' }));
  expressApp.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
