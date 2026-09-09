import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import 'module-alias/register';

import 'dotenv/config';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
function readCert(pathCandidates: string[]) {
  for (const p of pathCandidates) {
    if (existsSync(p)) return readFileSync(p);
  }
  throw new Error(
    'No TLS cert/key found. Checked: ' + pathCandidates.join(', '),
  );
}

async function bootstrap() {
  const root = join(__dirname, '..', ',,');
  const certCandidates = [
    process.env.SSL_CRT_FILE,
    join(root, 'localhost+2.pem'),
    join(root, 'localhost.pem'),
  ].filter(Boolean) as string[];

  const keyCandidates = [
    process.env.SSL_KEY_FILE,
    join(root, 'localhost+2-key.pem'),
    join(root, 'localhost-key.pem'),
  ].filter(Boolean) as string[];

  const httpsOptions = {
    cert: readCert(certCandidates),
    key: readCert(keyCandidates),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });
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

  await app.listen(process.env.PORT || 3001, '127.0.0.1');
}
bootstrap();
