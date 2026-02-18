import { otelSDK } from './tracing';
// Start SDK before importing other modules
otelSDK.start();

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { MikroORM } from '@mikro-orm/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
        clientId: 'crm-service',
      },
      consumer: {
        groupId: 'crm-consumer',
      },
    },
  });

  await app.startAllMicroservices();

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3005;

  // Schema & Seeding (for development)
  if (process.env.NODE_ENV !== 'production') {
      const orm = app.get(MikroORM);
      const generator = orm.getSchemaGenerator();
      await generator.ensureDatabase();
      await generator.updateSchema();
  }

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
