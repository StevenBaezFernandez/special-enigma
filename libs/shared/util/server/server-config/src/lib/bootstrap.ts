import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

export function setupGlobalConfig(app: INestApplication) {
  // Security Headers
  app.use(helmet());

  // CORS - Allow all for now or configure based on env
  app.enableCors({
    origin: process.env['CORS_ORIGIN']?.split(',') || true,
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Prefix
  app.setGlobalPrefix('api');
}
