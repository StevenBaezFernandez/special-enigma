import { Module } from '@nestjs/common';
import { AccountingApplicationModule } from '@virteex/domain-accounting-application';
import { TerminusModule } from '@nestjs/terminus';
import { AccountingController } from '../http/controllers/accounting.controller';
import { AccountingHealthController } from '../http/controllers/accounting-health.controller';

@Module({
  imports: [AccountingApplicationModule, TerminusModule],
  controllers: [AccountingController, AccountingHealthController],
})
export class AccountingRestModule {}
