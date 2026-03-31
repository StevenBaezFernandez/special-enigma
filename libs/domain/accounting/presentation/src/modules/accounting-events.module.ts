import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountingEventsController } from '../http/controllers/accounting-events.controller';
import { AccountingListener } from '../events/accounting.listener';

@Module({
  imports: [ConfigModule],
  controllers: [AccountingEventsController],
  providers: [AccountingListener],
})
export class AccountingEventsModule {}
