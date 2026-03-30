import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountingApplicationModule } from '@virteex/domain-accounting-application';
import { AccountingEventsController } from '../http/controllers/accounting-events.controller';
import { AccountingListener } from '../events/accounting.listener';

@Module({
  imports: [
    AccountingApplicationModule,
    ConfigModule,
  ],
  controllers: [AccountingEventsController],
  providers: [AccountingListener],
})
export class AccountingEventsModule {}
