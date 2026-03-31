import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';

import { AppModule } from './app/app.module';
import { setupGlobalConfig } from '@virteex/shared-util-server-server-config';

function shouldStartKafkaMicroservice(): boolean {
  if (process.env.ACCOUNTING_KAFKA_ENABLED === 'true') {
    return true;
  }

  if (process.env.ACCOUNTING_KAFKA_ENABLED === 'false') {
    return false;
  }

  return process.env.NODE_ENV === 'production';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupGlobalConfig(app);
  app.use(cookieParser());

  if (shouldStartKafkaMicroservice()) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        },
        consumer: {
          groupId: 'accounting-service-consumer',
        },
      },
    });

    await app.startAllMicroservices();
  } else {
    Logger.warn(
      'Kafka microservice disabled (set ACCOUNTING_KAFKA_ENABLED=true to enable).',
      'Bootstrap',
    );
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
