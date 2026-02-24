import { Injectable, Logger, Optional } from '@nestjs/common';
import { Twilio } from 'twilio';
import { SecretManagerService } from '@virteex/kernel-auth';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: Twilio | null = null;
  private fromNumber: string;

  constructor(@Optional() private readonly secretManager?: SecretManagerService) {
    const accountSid = this.secretManager?.getSecret('TWILIO_ACCOUNT_SID', '') || process.env.TWILIO_ACCOUNT_SID;
    const authToken = this.secretManager?.getSecret('TWILIO_AUTH_TOKEN', '') || process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = this.secretManager?.getSecret('TWILIO_PHONE_NUMBER', '') || process.env.TWILIO_PHONE_NUMBER || '';

    if (accountSid && authToken && this.fromNumber) {
      this.client = new Twilio(accountSid, authToken);
    } else {
      this.logger.warn('Twilio credentials not found. SMS service will run in simulation mode.');
    }
  }

  async sendSms(to: string, body: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.messages.create({
          body,
          from: this.fromNumber,
          to,
        });
        this.logger.log(`SMS sent to ${to}: ${body}`);
      } catch (error: any) {
        this.logger.error(`Failed to send SMS to ${to}: ${error.message}`);
      }
    } else {
      this.logger.log(`[SIMULATION] SMS to ${to}: ${body}`);
    }
  }
}
