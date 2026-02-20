import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from '../../../../libs/domains/notification/infrastructure/src/lib/services/email.service';
import { SmsService } from '../../../../libs/domains/notification/infrastructure/src/lib/services/sms.service';
import { PushNotificationService } from '../../../../libs/domains/notification/infrastructure/src/lib/services/push-notification.service';

@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushNotificationService
  ) {}

  @EventPattern('notification.send')
  async handleNotification(@Payload() data: { to: string; subject: string; body: string }) {
    this.logger.log(`Received notification request: ${JSON.stringify(data)}`);
    if (data.to && data.subject && data.body) {
      await this.emailService.sendEmail(data.to, data.subject, data.body);
    } else {
      this.logger.warn('Invalid notification payload');
    }
  }

  @EventPattern('notification.sms.send')
  async handleSmsNotification(@Payload() data: { to: string; body: string }) {
    this.logger.log(`Received SMS notification request: ${JSON.stringify(data)}`);
    if (data.to && data.body) {
      await this.smsService.sendSms(data.to, data.body);
    } else {
      this.logger.warn('Invalid SMS notification payload');
    }
  }

  @EventPattern('notification.push.send')
  async handlePushNotification(@Payload() data: { token: string; title: string; body: string; data?: any }) {
    this.logger.log(`Received Push notification request: ${JSON.stringify(data)}`);
    if (data.token && data.title && data.body) {
      await this.pushService.sendPushNotification(data.token, data.title, data.body, data.data);
    } else {
      this.logger.warn('Invalid Push notification payload');
    }
  }

  @EventPattern('user.registered')
  async handleUserRegistered(@Payload() data: { email: string; name: string }) {
      this.logger.log(`User registered: ${data.email}`);
      await this.emailService.sendEmail(
          data.email,
          'Welcome to Virteex ERP',
          `Hello ${data.name}, welcome to Virteex ERP! Your account has been created.`
      );
  }
}
