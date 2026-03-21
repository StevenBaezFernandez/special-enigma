import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupGlobalConfig } from '@virteex/shared-util-server-server-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply Global Configuration (Security, Pipes, Filters, Throttling)
  setupGlobalConfig(app);

  const port = process.env.PORT || 3100;
  const globalPrefix = 'api';

  await app.listen(port);
  Logger.log(
    `🚀 BFF is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
