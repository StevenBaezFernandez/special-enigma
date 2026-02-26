import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { context, trace } from '@opentelemetry/api';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const span = trace.getSpan(context.active());
    const traceId = span ? span.spanContext().traceId : undefined;

    const errorResponse = {
      type: 'about:blank', // Should be a URI reference that identifies the problem type
      title: exception instanceof HttpException ? (exception as any).constructor.name : 'InternalServerError',
      status: status,
      detail: typeof message === 'object' && message !== null ? (message as any).message || message : message,
      instance: request.url,
      timestamp: new Date().toISOString(),
      traceId: traceId,
      path: request.url, // Legacy support
    };

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Http Status: ${status} Error Message: ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : ''
      );
    } else {
      this.logger.warn(
        `Http Status: ${status} Error Message: ${JSON.stringify(message)}`
      );
    }

    // Ensure we don't leak stack traces in production for 500 errors unless specifically enabled
    if (process.env['NODE_ENV'] === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR) {
        errorResponse.detail = 'Internal Server Error';
    }

    response.status(status).json(errorResponse);
  }
}
