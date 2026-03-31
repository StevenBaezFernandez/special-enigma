import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MikroOrmModule as NestMikroOrmModule } from '@mikro-orm/nestjs';
import {
  ACCOUNT_REPOSITORY,
  JOURNAL_ENTRY_REPOSITORY,
  POLICY_REPOSITORY,
  OUTBOX_REPOSITORY,
} from '@virteex/domain-accounting-domain';
import { TELEMETRY_SERVICE } from '@virteex/kernel-telemetry';
import {
  MESSAGE_BROKER,
  I_UNIT_OF_WORK,
  DimensionValidator,
  ACCOUNTING_EVENT_CONSUMER_PORT,
} from '@virteex/domain-accounting-application';
import { ACCOUNTING_REPORTING_PORT } from '@virteex/domain-accounting-contracts';
import { TelemetryService } from '@virteex/kernel-telemetry';
import { MikroOrmAccountRepository } from './persistence/repositories/mikro-orm-account.repository';
import { JournalEntryRepositoryAdapter } from './persistence/repositories/journal-entry-repository-adapter';
import { MikroOrmReportingAdapter } from './persistence/repositories/mikro-orm-reporting-adapter';
import { MikroOrmUnitOfWorkAdapter } from './persistence/repositories/mikro-orm-unit-of-work-adapter';
import { MikroOrmPolicyRepository } from './persistence/repositories/mikro-orm-policy.repository';
import { MikroOrmOutboxRepository } from './persistence/repositories/mikro-orm-outbox.repository';
import {
  AccountSchema,
  JournalEntrySchema,
  JournalEntryLineSchema,
  FiscalYearSchema,
  AccountingPolicySchema,
} from './persistence/orm/mikro-orm.schemas';
import { OutboxMessageSchema } from './persistence/orm/outbox.schema';
import { OutboxRelayService } from './messaging/outbox/outbox-relay.service';
import { KafkaMessageBroker } from './messaging/producers/kafka-message-broker';
import { AccountingEventConsumerService } from './messaging/consumers/accounting-event-consumer.service';

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    NestMikroOrmModule.forFeature([
      AccountSchema,
      JournalEntrySchema,
      JournalEntryLineSchema,
      FiscalYearSchema,
      AccountingPolicySchema,
      OutboxMessageSchema,
    ]),
  ],
  providers: [
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: MikroOrmAccountRepository,
    },
    {
      provide: JOURNAL_ENTRY_REPOSITORY,
      useClass: JournalEntryRepositoryAdapter,
    },
    {
      provide: ACCOUNTING_REPORTING_PORT,
      useClass: MikroOrmReportingAdapter,
    },
    {
      provide: I_UNIT_OF_WORK,
      useClass: MikroOrmUnitOfWorkAdapter,
    },
    {
      provide: POLICY_REPOSITORY,
      useClass: MikroOrmPolicyRepository,
    },
    {
      provide: OUTBOX_REPOSITORY,
      useClass: MikroOrmOutboxRepository,
    },
    {
      provide: TELEMETRY_SERVICE,
      useClass: TelemetryService,
    },
    {
      provide: MESSAGE_BROKER,
      useClass: KafkaMessageBroker,
    },
    {
      provide: ACCOUNTING_EVENT_CONSUMER_PORT,
      useClass: AccountingEventConsumerService,
    },
    DimensionValidator,
    OutboxRelayService,
  ],
  exports: [
    ACCOUNTING_EVENT_CONSUMER_PORT,
    ACCOUNT_REPOSITORY,
    JOURNAL_ENTRY_REPOSITORY,
    POLICY_REPOSITORY,
    OUTBOX_REPOSITORY,
    ACCOUNTING_REPORTING_PORT,
    I_UNIT_OF_WORK,
    MESSAGE_BROKER,
    TELEMETRY_SERVICE,
    NestMikroOrmModule,
    DimensionValidator,
  ],
})
export class AccountingInfrastructureModule {}
