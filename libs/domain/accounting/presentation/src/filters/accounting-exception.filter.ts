import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AccountingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AccountingExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: (exception as any)?.message || 'Internal Server Error',
    };

    this.logger.error(`Exception on ${request.url}: ${errorResponse.message}`, (exception as any)?.stack);

    response.status(status).json(errorResponse);
  }
}
