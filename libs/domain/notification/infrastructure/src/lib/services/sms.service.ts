import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.client = new Twilio(accountSid || 'dummy', authToken || 'dummy');
  }

  async sendSms(to: string, body: string): Promise<void> {
    try {
      const message = await this.client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });
      this.logger.log(`SMS successfully sent to ${to}, SID: ${message.sid}`);
    } catch (err: any) {
      this.logger.error(`Error sending SMS to ${to}: ${err.message}`);
      throw err;
    }
  }
}
