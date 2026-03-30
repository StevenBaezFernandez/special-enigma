import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ScheduleModule } from '@nestjs/schedule';
import {
  ACCOUNT_REPOSITORY,
  JOURNAL_ENTRY_REPOSITORY,
  POLICY_REPOSITORY,
  OUTBOX_REPOSITORY,
  TELEMETRY_SERVICE,
} from '@virteex/domain-accounting-domain';
import {
  MESSAGE_BROKER,
  I_UNIT_OF_WORK,
  DimensionValidator,
} from '@virteex/domain-accounting-application';
import { ACCOUNTING_REPORTING_PORT } from '@virteex/domain-accounting-contracts';
import { TelemetryService } from '@virteex/kernel-telemetry';
import { MikroOrmAccountRepository } from './persistence/repositories/mikro-orm-account.repository';
import { MikroOrmJournalEntryRepository } from './persistence/repositories/mikro-orm-journal-entry.repository';
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

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    MikroOrmModule.forFeature([
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
      useClass: MikroOrmJournalEntryRepository,
    },
    {
      provide: ACCOUNTING_REPORTING_PORT,
      useClass: MikroOrmJournalEntryRepository,
    },
    {
      provide: I_UNIT_OF_WORK,
      useClass: MikroOrmJournalEntryRepository,
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
    DimensionValidator,
    OutboxRelayService,
  ],
  exports: [
    ACCOUNT_REPOSITORY,
    JOURNAL_ENTRY_REPOSITORY,
    POLICY_REPOSITORY,
    OUTBOX_REPOSITORY,
    ACCOUNTING_REPORTING_PORT,
    I_UNIT_OF_WORK,
    MESSAGE_BROKER,
    TELEMETRY_SERVICE,
    MikroOrmModule,
  ],
})
export class AccountingInfrastructureModule {}
