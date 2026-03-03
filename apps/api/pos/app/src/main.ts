import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PosApiModule } from './app/pos-api.module';
import { setupGlobalConfig } from '@virteex/shared-util-server-server-config';

async function bootstrap() {
  const app = await NestFactory.create(PosApiModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Apply shared global config (pipes, filters, security headers)
  setupGlobalConfig(app);

  const port = process.env.PORT || 3008;
  await app.listen(port);
  Logger.log(
    `🚀 POS API is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
