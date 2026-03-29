import { INestApplication, ValidationPipe, Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(30000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}

export function setupGlobalConfig(app: INestApplication, serviceName?: string) {
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();

  // Trust Proxy (Required for many cloud deployments to get correct IP)
  if (typeof instance.set === 'function') {
    instance.set('trust proxy', 1);
  }

  // Security Headers
  app.use(helmet());

  // CORS - Allow based on env or default to true for development
  app.enableCors({
    origin: process.env['CORS_ORIGIN']?.split(',') || true,
    credentials: true,
  });

  // Request ID Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] || uuidv4();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-Id', requestId as string);
    next();
  });

  // Payload Limits
  if (typeof instance.use === 'function') {
    // For Express-based apps
    const express = require('express');
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));
  }

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Global Interceptors
  app.useGlobalInterceptors(new TimeoutInterceptor());

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Prefix
  const globalPrefix = serviceName ? `api/${serviceName}` : 'api';
  app.setGlobalPrefix(globalPrefix);
}
