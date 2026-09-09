import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import 'module-alias/register';

import 'dotenv/config';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const allowedOrigins = (process.env.CORS_ORIGINS || 'https://127.0.0.1:3000')
    .split(',')
    .map((s) => s.trim());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT || 3001, '0.0.0.0');
}
bootstrap();
