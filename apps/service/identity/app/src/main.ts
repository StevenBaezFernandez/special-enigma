import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import Redis from 'ioredis';
import passport from 'passport';
import { AppModule } from './app/app.module';
import { setupGlobalConfig } from '@virteex/shared-util-server-server-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupGlobalConfig(app, 'identity-service');

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
      secret: process.env.NODE_ENV === 'production' ? sessionSecret! : (sessionSecret || 'virteex-dev-secret-session'),
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
