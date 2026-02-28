import { otelSDK } from './tracing';
// Start SDK before importing other modules
otelSDK.start();

import { Logger } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { InitialSeederService } from './app/seeds/initial-seeder.service';
import { MikroORM } from '@mikro-orm/core';
import { setupGlobalConfig } from '@virteex/shared-util-server-config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      },
      consumer: {
        groupId: 'gateway-consumer',
      },
    },
  });

  await app.startAllMicroservices();

  app.useLogger(app.get(PinoLogger));
  const logger = new Logger('Bootstrap');

  // Database Initialization (Robust)
  if (process.env.NODE_ENV !== 'production') {
    try {
        logger.log('Initializing Database Schema...');
        const orm = app.get(MikroORM);
        const generator = orm.getSchemaGenerator();
        await generator.ensureDatabase();

        // Ensure schemas exist for Postgres
        const configService = app.get(ConfigService);
        if (configService.get('DB_DRIVER') === 'postgres') {
            try {
                await (orm.em as any).execute('CREATE SCHEMA IF NOT EXISTS identity');
            } catch (err: any) {
                logger.warn(`Failed to create schema 'identity': ${err.message}`);
            }
        }

        await generator.updateSchema();
        logger.log('Database Schema Initialized.');

        // Run Seeder
        logger.log('Running Seeders...');
        const seeder = app.get(InitialSeederService);
        await seeder.seed();
        logger.log('Seeding Complete.');
    } catch (error) {
        logger.error('Database Initialization Failed', error);
        // We might want to exit here if DB is critical, but for now we log and continue (or let it crash later)
    }
  }

  const configService = app.get(ConfigService);

  // Apply Global Configuration (Security, Pipes, Filters)
  setupGlobalConfig(app);

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Virteex ERP API')
    .setDescription('The Virteex ERP API description')
    .setVersion('1.0')
    .addTag('virteex')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') || 3000;
  const globalPrefix = 'api'; // configured in setupGlobalConfig

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `📄 Swagger documentation available at: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
