import { Module } from '@nestjs/common';
import { AccountingApplicationWiringModule } from '@virteex/domain-accounting-infrastructure';
import { TerminusModule } from '@nestjs/terminus';
import { AccountingController } from '../http/controllers/accounting.controller';
import { AccountingHealthController } from '../http/controllers/accounting-health.controller';

@Module({
  imports: [
    AccountingApplicationWiringModule,
    TerminusModule,
  ],
  controllers: [AccountingController, AccountingHealthController],
})
export class AccountingRestModule {}
