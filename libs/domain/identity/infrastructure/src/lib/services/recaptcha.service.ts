import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CriticalConfigurationException } from '@virteex/kernel-exceptions';
import { lastValueFrom } from 'rxjs';
import { RecaptchaPort } from '@virteex/domain-identity-domain';

@Injectable()
export class RecaptchaService implements RecaptchaPort {
  private readonly logger = new Logger(RecaptchaService.name);
  private readonly secretKey: string;
  private readonly enabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY') || '';
    this.enabled = this.configService.get<boolean>('RECAPTCHA_ENABLED', true);

    if (this.enabled && !this.secretKey) {
      this.logger.warn('RECAPTCHA_SECRET_KEY is not defined but reCAPTCHA is enabled');
    }

    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    if (isProd && !this.enabled) {
      throw new CriticalConfigurationException('reCAPTCHA cannot be disabled in production');
    }
  }

  async verify(token: string, action?: string): Promise<boolean> {
    if (!this.enabled) {
      return true;
    }

    if (!token) {
      return false;
    }

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${this.secretKey}&response=${token}`,
          {},
        ),
      );

      const { success, score, action: responseAction } = response.data;

      if (!success) {
        this.logger.warn(`reCAPTCHA verification failed for action ${action}`);
        return false;
      }

      // If it's v3, check the score (default threshold 0.5)
      if (score !== undefined && score < 0.5) {
        this.logger.warn(`reCAPTCHA score too low: ${score} for action ${action}`);
        return false;
      }

      if (action && responseAction && action !== responseAction) {
        this.logger.warn(`reCAPTCHA action mismatch: expected ${action}, got ${responseAction}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error verifying reCAPTCHA', error);
      return false;
    }
  }
}
