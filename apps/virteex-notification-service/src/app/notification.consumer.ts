import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from '../../../../libs/domains/notification/infrastructure/src/lib/services/email.service';

@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(private readonly emailService: EmailService) {}

  @EventPattern('notification.send')
  async handleNotification(@Payload() data: { to: string; subject: string; body: string }) {
    this.logger.log(`Received notification request: ${JSON.stringify(data)}`);
    if (data.to && data.subject && data.body) {
      await this.emailService.sendEmail(data.to, data.subject, data.body);
    } else {
      this.logger.warn('Invalid notification payload');
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
