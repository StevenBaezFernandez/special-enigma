import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Response, Request } from 'express';

@Catch()
export class AccountingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AccountingExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const isGql = host.getType().toString() === 'graphql';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = (exception as any)?.message || 'Internal Server Error';
    let path = 'UNKNOWN';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message = typeof response === 'object' ? (response as any).message || message : response;
    }

    if (isGql) {
      const gqlHost = GqlArgumentsHost.create(host);
      const info = gqlHost.getInfo();
      path = info?.fieldName || 'GraphQL Query';
      this.logger.error(`[GraphQL] Exception on ${path}: ${message}`, (exception as any)?.stack);
      // NestJS handles GraphQL errors by returning them in the response.
      // Throwing it back for the GraphQL engine to handle is correct.
      return exception;
    } else {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      path = request.url;

      const errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path,
        message,
      };

      this.logger.error(`[HTTP] Exception on ${path}: ${message}`, (exception as any)?.stack);
      response.status(status).json(errorResponse);
    }
  }
}
