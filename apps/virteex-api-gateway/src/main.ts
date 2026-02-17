/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { otelSDK } from './tracing';
// Start SDK before importing other modules
otelSDK.start();

import { Logger, ValidationPipe } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './app/filters/global-exception.filter';
import { InitialSeederService } from './app/seeds/initial-seeder.service';
import { MikroORM } from '@mikro-orm/core';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      },
      consumer: {
        groupId: 'api-gateway-consumer',
      },
    },
  });

  await app.startAllMicroservices();

  app.useLogger(app.get(PinoLogger));

  // Ensure Database Schema exists (Auto-migration for dev/demo)
  // This is critical for SQLite in-memory or file-based DBs to have tables created before seeding.
  if (process.env.NODE_ENV !== 'production') {
    const orm = app.get(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.ensureDatabase();

    // Ensure schemas exist for Postgres
    try {
      const configService = app.get(ConfigService);
      if (configService.get('DB_DRIVER') === 'postgres') {
        await (orm.em as any).execute('CREATE SCHEMA IF NOT EXISTS identity');
      }
    } catch (error) {
      // Ignore if not supported or fails
    }

    await generator.updateSchema();
  }

  // Run Seeder
  const seeder = app.get(InitialSeederService);
  await seeder.seed();
  const configService = app.get(ConfigService);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN')?.split(',') || ['http://localhost:4200'],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

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

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `📄 Swagger documentation available at: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
