import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  OUTBOX_REPOSITORY,
  type OutboxRepository,
  TELEMETRY_SERVICE,
  type ITelemetryService,
} from '@virteex/domain-accounting-domain';
import {
  MESSAGE_BROKER,
  type IMessageBroker,
} from '@virteex/domain-accounting-application';

/**
 * Service responsible for relaying domain events from the outbox table to the message broker.
 */
@Injectable()
export class OutboxRelayService implements OnModuleInit {
  private readonly logger = new Logger(OutboxRelayService.name);
  private isProcessing = false;
  private readonly isOutboxRequired =
    process.env['ACCOUNTING_OUTBOX_REQUIRED'] === 'true' ||
    process.env['NODE_ENV'] === 'production';
  private readonly isDbConnected = process.env['ACCOUNTING_DB_CONNECT'] === 'true';
  private hasLoggedOutboxSkip = false;

  constructor(
    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: OutboxRepository,
    @Inject(TELEMETRY_SERVICE)
    private readonly telemetryService: ITelemetryService,
    @Inject(MESSAGE_BROKER)
    private readonly messageBroker: IMessageBroker,
  ) {}

  async onModuleInit() {
    if (this.isOutboxRequired) {
      if (!this.isDbConnected) {
        const errorMsg = 'Outbox relay is required but ACCOUNTING_DB_CONNECT is not enabled.';
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      const brokers = process.env['KAFKA_BROKERS'] ? process.env['KAFKA_BROKERS'].split(',') : [];
      if (brokers.length === 0) {
        const errorMsg = 'Outbox relay is required but KAFKA_BROKERS are not configured.';
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutbox() {
    if (!this.isDbConnected && !this.isOutboxRequired) {
      if (!this.hasLoggedOutboxSkip) {
        this.logger.warn(
          'Outbox relay skipped because ACCOUNTING_DB_CONNECT is disabled and outbox is not strictly required in this environment.',
        );
        this.hasLoggedOutboxSkip = true;
      }
      return;
    }

    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const messages = await this.outboxRepository.findUnprocessed(20);

      for (const message of messages) {
        try {
          this.logger.log(
            `Publishing event ${message.eventType} for aggregate ${message.aggregateId}`,
          );

          await this.messageBroker.publish(message.eventType, message.payload);

          await this.outboxRepository.markAsProcessed(message.id);
          this.telemetryService.recordBusinessMetric(
            'outbox_processed_total',
            1,
            { eventType: message.eventType },
          );
          this.logger.log(`Marked event ${message.id} as processed`);
        } catch (error) {
          this.telemetryService.recordBusinessMetric(
            'outbox_publish_failures_total',
            1,
            { eventType: message.eventType },
          );
          this.logger.error(
            `Failed to process outbox message ${message.id}: ${(error as Error).message}`,
          );
        }
      }

      // Check for pending count if repository supports it, otherwise simulated or skip
      // const pendingCount = await (this.outboxRepository as any).countUnprocessed?.() || 0;
      // this.telemetryService.recordBusinessMetric('outbox_pending_count', pendingCount);
    } catch (error) {
      this.logger.error(
        `Error fetching unprocessed outbox messages: ${(error as Error).message}`,
      );
    } finally {
      this.isProcessing = false;
    }
  }
}
