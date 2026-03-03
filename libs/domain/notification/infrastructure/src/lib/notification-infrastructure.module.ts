import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushNotificationService } from './services/push-notification.service';

@Module({
  providers: [EmailService, SmsService, PushNotificationService],
  exports: [EmailService, SmsService, PushNotificationService],
})
export class NotificationInfrastructureModule {}
