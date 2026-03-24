import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CriticalConfigurationException } from '@virteex/kernel-exceptions';
import { CachePort, NotificationService } from '@virteex/domain-identity-domain';

@Injectable()
export class ConfigurationValidatorService implements OnModuleInit {
  private readonly logger = new Logger(ConfigurationValidatorService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly cachePort: CachePort,
    @Inject(NotificationService) private readonly notificationService: NotificationService
  ) {}

  async onModuleInit() {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    if (!isProd) {
        return;
    }

    this.logger.log('Validating critical configurations for production...');

    // Validate Redis
    try {
        await this.cachePort.get('health-check');
        this.logger.log('Redis connection validated.');
    } catch (error) {
        this.logger.error('Failed to connect to Redis in production', error);
        throw new CriticalConfigurationException('Redis connection is required in production');
    }

    // Validate SMTP (Nodemailer)
    try {
        const success = await (this.notificationService as any).verifyConnection();
        if (!success) {
            throw new Error('SMTP verification returned false');
        }
        this.logger.log('SMTP connection validated.');
    } catch (error) {
        this.logger.error('Failed to verify SMTP connection in production', error);
        throw new CriticalConfigurationException('SMTP connection is required in production');
    }

    this.logger.log('All critical configurations validated successfully.');
  }
}
