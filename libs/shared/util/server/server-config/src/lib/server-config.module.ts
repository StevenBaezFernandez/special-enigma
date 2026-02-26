import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import { GlobalConfigService } from './global-config.service';
import { IdempotencyService } from './services/idempotency.service';
import { LoggerService } from './services/logger.service';
import { LoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          pinoHttp: {
            level: config.get('LOG_LEVEL') || 'info',
            transport: config.get('NODE_ENV') !== 'production'
              ? { target: 'pino-pretty' }
              : undefined,
          },
        };
      },
    }),
  ],
  providers: [GlobalConfigService, IdempotencyService, LoggerService],
  exports: [ConfigModule, GlobalConfigService, IdempotencyService, LoggerService, LoggerModule],
})
export class ServerConfigModule {}
