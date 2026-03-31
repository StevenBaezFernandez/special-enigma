import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Response, Request } from 'express';
import { AccountingDomainError } from '@virteex/domain-accounting-domain';

@Catch()
export class AccountingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AccountingExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const isGql = host.getType().toString() === 'graphql';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let path = 'UNKNOWN';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message = typeof response === 'object' && response !== null && 'message' in response ? (response as { message?: string }).message || exception.message : exception.message;
      errorCode = 'HTTP_EXCEPTION';
    } else if (exception instanceof AccountingDomainError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      errorCode = exception.constructor.name;
    }

    const stack = exception instanceof Error ? exception.stack : undefined;

    if (isGql) {
      const gqlHost = GqlArgumentsHost.create(host);
      const info = gqlHost.getInfo();
      path = info?.fieldName || 'GraphQL Query';
      this.logger.error(`[GraphQL] Exception on ${path}: ${message}`, stack);
      return exception;
    } else {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      path = request.url;

      const errorResponse = {
        statusCode: status,
        errorCode,
        timestamp: new Date().toISOString(),
        path,
        message: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'An unexpected error occurred' : message,
      };

      this.logger.error(`[HTTP] Exception on ${path}: ${message}`, stack);
      response.status(status).json(errorResponse);
    }
  }
}
