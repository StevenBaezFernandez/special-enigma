import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupGlobalConfig } from '@virteex/shared-util-server-server-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply Global Configuration (Security, Pipes, Filters, Throttling, Global Prefix)
  setupGlobalConfig(app, 'portal');

  const port = process.env.PORT || 3100;

  await app.listen(port);
  Logger.log(`🚀 BFF is running on: http://localhost:${port}/api/portal`);
}

bootstrap();
