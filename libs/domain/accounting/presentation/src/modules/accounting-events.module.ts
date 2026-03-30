import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountingApplicationWiringModule } from '@virteex/domain-accounting-infrastructure';
import { AccountingEventsController } from '../http/controllers/accounting-events.controller';
import { AccountingListener } from '../events/accounting.listener';

@Module({
  imports: [
    AccountingApplicationWiringModule,
    ConfigModule,
  ],
  controllers: [AccountingEventsController],
  providers: [AccountingListener],
})
export class AccountingEventsModule {}
