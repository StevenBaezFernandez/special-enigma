import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import passport from 'passport';
import helmet from 'helmet';
import { AppModule } from './app/app.module';
import { CsrfMiddleware } from '@virteex/kernel-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:4200', 'http://localhost:8100'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-XSRF-TOKEN'],
  });

  app.use(cookieParser());

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set in production');
  }

  // Initialize Redis client for session storage
  const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'virteex_sess:',
  });

  app.use(
    session({
      store: redisStore,
      secret: sessionSecret || 'virteex-dev-secret-session',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Custom CSRF Middleware using Double Submit Cookie pattern
  // Compatible with Angular's HttpClient XSRF-TOKEN handling
  app.use(new CsrfMiddleware().use);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
