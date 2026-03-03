
import { otelSDK } from './tracing';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupGlobalConfig } from '@virteex/shared-util-server-server-config';

async function bootstrap() {
  // Start OpenTelemetry SDK
  otelSDK.start();

  const app = await NestFactory.create(AppModule);

  // Apply Global Configuration (Security, Pipes, Filters, Throttling)
  setupGlobalConfig(app);

  const port = process.env.PORT || 3000;
  const globalPrefix = 'api'; // configured in setupGlobalConfig

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
