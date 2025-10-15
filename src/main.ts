import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './http-exception/http-exception.filter';

//
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

//

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
  // app.use(
  //   '/uploads',
  //   express.static(path.join(process.cwd(), 'uploads'), {
  //     setHeaders: (res) => {
  //       res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  //       res.setHeader('Access-Control-Allow-Origin', '*');
  //     },
  //   }),
  // );
  expressApp.use(express.json({ limit: '140mb' }));
  expressApp.use(express.urlencoded({ extended: true, limit: '140mb' }));
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
// async function bootstrap() {
//   const app = await NestFactory.createMicroservice(AppModule, {
//     transport: Transport.GRPC,
//     options: {
//       package: 'greeter',
//       protoPath: path.resolve(__dirname, '../../proto/greeter.proto'),
//     },
//   });

//   await app.listen().then(() => {
//     console.log('🚀 gRPC microservice is running');
//   });
// }
