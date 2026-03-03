import { Injectable, Logger } from '@nestjs/common';
import { Job } from '../domain/entities/job.entity';
import { NotificationService } from '@virteex/domain-notification-application';
import { NotificationChannel } from '@virteex/domain-notification-domain';
import { EntityManager } from '@mikro-orm/core';
import { FiscalDomainService } from '@virteex/domain-fiscal-domain';

@Injectable()
export class FiscalJobHandler {
  private readonly logger = new Logger(FiscalJobHandler.name);

  constructor(
    private readonly em: EntityManager,
    private readonly notificationService: NotificationService,
    private readonly fiscalDomainService: FiscalDomainService
  ) {}

  async handleInvoiceIssued(job: Job): Promise<void> {
    const { invoiceId, tenantId, status } = job.payload;

    this.logger.log(`Processing fiscal job for invoice ${invoiceId}`);

    const realStatus = await this.fiscalDomainService.verifyInvoiceLegalStatus(invoiceId, tenantId);

    if (realStatus !== status) {
      throw new Error(`Inconsistent legal status for invoice ${invoiceId}: Expected ${status}, but found ${realStatus}`);
    }

    await this.notificationService.createNotification({
      tenantId,
      userId: job.payload['userId'],
      channel: NotificationChannel.EMAIL,
      templateId: 'fiscal.invoice_issued',
      templateVersion: '1.0.0',
      payload: { ...job.payload, category: 'fiscal' },
      recipient: job.payload['customerEmail'],
      idempotencyKey: `fiscal:${invoiceId}:${job.attempts}`,
    });

    this.logger.log(`Fiscal notification triggered for invoice ${invoiceId}`);
  }
}
