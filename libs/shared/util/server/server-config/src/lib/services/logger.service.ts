import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { trace, context } from '@opentelemetry/api';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('ApplicationLogger');
  }

  log(message: any, ...optionalParams: any[]) {
    this.call('info', message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.call('error', message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.call('warn', message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.call('debug', message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.call('trace', message, ...optionalParams);
  }

  private call(level: 'info' | 'error' | 'warn' | 'debug' | 'trace', message: any, ...optionalParams: any[]) {
    const span = trace.getSpan(context.active());
    const traceId = span?.spanContext().traceId;
    const spanId = span?.spanContext().spanId;

    if (traceId) {
      const logObject = {
        traceId,
        spanId,
        msg: typeof message === 'string' ? message : undefined,
        ...((typeof message === 'object') ? message : {}),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.logger as any)[level](logObject, ...optionalParams);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.logger as any)[level](message, ...optionalParams);
    }
  }
}
