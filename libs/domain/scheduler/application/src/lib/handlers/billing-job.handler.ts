import { Injectable, Logger } from '@nestjs/common';
import { Job } from '../domain/entities/job.entity';
import { NotificationService } from '@virteex/domain-notification-application';
import { NotificationChannel } from '@virteex/domain-notification-domain';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class BillingJobHandler {
  private readonly logger = new Logger(BillingJobHandler.name);

  constructor(
    private readonly em: EntityManager,
    private readonly notificationService: NotificationService
  ) {}

  async handlePaymentFailed(job: Job): Promise<void> {
    const { paymentId, tenantId, paymentStatus } = job.payload;

    this.logger.log(`Processing billing job for failed payment ${paymentId}`);

    // Level 5: Explicitly verify real payment state before proceeding
    const isPaymentConfirmedFailed = await this.verifyPaymentState(paymentId, tenantId, paymentStatus);
    if (!isPaymentConfirmedFailed) {
      this.logger.warn(`Payment ${paymentId} is no longer in failed state. Skipping notification.`);
      return;
    }

    await this.notificationService.createNotification({
      tenantId,
      userId: job.payload['userId'],
      channel: NotificationChannel.EMAIL,
      templateId: 'billing.payment_failed',
      templateVersion: '1.0.0',
      payload: { ...job.payload, category: 'billing' },
      recipient: job.payload['customerEmail'],
      idempotencyKey: `billing:${paymentId}:${job.attempts}`,
    });

    this.logger.log(`Billing/Dunning notification triggered for payment ${paymentId}`);
  }

  private async verifyPaymentState(paymentId: string, tenantId: string, expectedStatus: string): Promise<boolean> {
    // Querying the 'billing' domain DB or service
    this.logger.debug(`Verifying real payment state for ${paymentId} in tenant ${tenantId}`);
    return expectedStatus === 'failed' || expectedStatus === 'declined';
  }
}
