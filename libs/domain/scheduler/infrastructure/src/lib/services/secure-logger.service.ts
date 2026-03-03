import { Injectable } from '@nestjs/common';
import { pino } from 'pino';

@Injectable()
export class SecureLoggerService {
  private readonly logger = pino({
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    mixin() {
      return { service: 'virteex-workers' };
    },
    hooks: {
      logMethod(inputArgs, method) {
        const redactedArgs = inputArgs.map((arg) => {
          if (typeof arg === 'object' && arg !== null) {
            return this.redactPII(arg);
          }
          return arg;
        });
        return method.apply(this, redactedArgs as any);
      },
    },
  });

  private static redactPII(obj: any): any {
    const piiFields = ['email', 'phone', 'recipient', 'address', 'password', 'token'];
    const redacted = { ...obj };

    for (const field of piiFields) {
      if (field in redacted) {
        redacted[field] = '***REDACTED***';
      }
    }

    // Deep redaction if needed
    for (const key in redacted) {
      if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        redacted[key] = this.redactPII(redacted[key]);
      }
    }

    return redacted;
  }

  log(msg: string, metadata?: any) {
    this.logger.info(metadata || {}, msg);
  }

  error(msg: string, err?: any, metadata?: any) {
    this.logger.error({ ...(metadata || {}), err }, msg);
  }

  warn(msg: string, metadata?: any) {
    this.logger.warn(metadata || {}, msg);
  }
}
