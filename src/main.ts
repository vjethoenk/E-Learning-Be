import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());

  // Set global guard
  const reflector = app.get(Reflector);
  app.setGlobalPrefix('api');
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  //config cors
  const isProd = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: isProd ? true : 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });
  app.use(cookieParser());

  // if (isProd) {
  //   const frontendPath = path.join(
  //     __dirname,
  //     '..',
  //     '..',
  //     'e-learning-fe',
  //     'dist',
  //   );
  //   app.use(express.static(frontendPath));

  //   app.use((req, res, next) => {
  //     if (req.url.startsWith('/api')) {
  //       return next();
  //     }

  //     res.sendFile(path.join(frontendPath, 'index.html'));
  //   });
  // }

  // app.use((req, res, next) => {
  //   res.setHeader('Cache-Control', 'no-store');
  //   next();
  // });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
