import { Injectable, Logger } from '@nestjs/common';
import { Notification, NotificationChannel, NotificationStatus } from '../domain/entities/notification.entity';
import { NotificationStateMachine } from '../domain/notification-state-machine';
import { EmailService, SmsService, PushNotificationService } from '@virteex/domain-notification-infrastructure';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class NotificationOrchestrator {
  private readonly logger = new Logger(NotificationOrchestrator.name);

  constructor(
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushNotificationService
  ) {}

  async send(notification: Notification): Promise<void> {
    this.logger.log(`Orchestrating notification ${notification.id} via ${notification.channel}`);

    try {
      // Step 1: Render Template (Placeholder for Step 7)
      NotificationStateMachine.transition(notification, NotificationStatus.RENDERED);
      await this.em.flush();

      // Step 2: Policy & Preference Check (Placeholder for Step 7)
      // Check ConsentLedger, NotificationPreference, and Quiet Hours

      // Step 3: Dispatch to Provider
      NotificationStateMachine.transition(notification, NotificationStatus.QUEUED_PROVIDER);
      await this.em.flush();

      await this.dispatch(notification);

      NotificationStateMachine.transition(notification, NotificationStatus.SENT_PROVIDER);
      await this.em.flush();
    } catch (err: any) {
      this.logger.error(`Failed to send notification ${notification.id}: ${err.message}`);
      NotificationStateMachine.transition(notification, NotificationStatus.FAILED_TERMINAL, err.message);
      await this.em.flush();
    }
  }

  private async dispatch(notification: Notification): Promise<void> {
    switch (notification.channel) {
      case NotificationChannel.EMAIL:
        await this.emailService.sendEmail(
          notification.recipient,
          notification.payload['subject'] || 'No Subject',
          notification.payload['body'] || ''
        );
        break;
      case NotificationChannel.SMS:
        await this.smsService.sendSms(notification.recipient, notification.payload['body'] || '');
        break;
      case NotificationChannel.PUSH:
        await this.pushService.sendPushNotification(
          notification.recipient,
          notification.payload['title'] || 'No Title',
          notification.payload['body'] || '',
          notification.payload['data']
        );
        break;
      default:
        throw new Error(`Unsupported channel: ${notification.channel}`);
    }
  }
}
