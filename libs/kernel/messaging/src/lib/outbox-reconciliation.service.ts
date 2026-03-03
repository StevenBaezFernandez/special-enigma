import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { OutboxEvent } from './entities/outbox-event.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OutboxReconciliationService {
  private readonly logger = new Logger(OutboxReconciliationService.name);

  constructor(private readonly em: EntityManager) {}

  @Cron(CronExpression.EVERY_HOUR)
  async reconcile() {
    this.logger.log('Starting Outbox reconciliation...');

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const stuckEvents = await this.em.find(OutboxEvent, {
      publishedAt: null,
      createdAt: { $lt: fiveMinutesAgo }
    });

    if (stuckEvents.length > 0) {
      this.logger.warn(`Found ${stuckEvents.length} stuck outbox events. Alerting SRE.`);

      for (const event of stuckEvents) {
        this.logger.error(`Stuck Event ID: ${event.id}, Aggregate: ${event.aggregateType}:${event.aggregateId}`);
      }
    } else {
      this.logger.log('Outbox is healthy. No stuck events found.');
    }
  }
}
