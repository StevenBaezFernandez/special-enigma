import { Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class GlobalBffExceptionHandler extends BaseExceptionFilter {
  private readonly logger = new Logger(GlobalBffExceptionHandler.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception?.message || 'Internal server error',
      code: exception?.code || 'BFF_UNKNOWN_ERROR',
    };

    this.logger.error(`BFF Error at ${request.url}: ${exception.message}`, exception.stack);

    response.status(status).json(errorResponse);
  }
}
