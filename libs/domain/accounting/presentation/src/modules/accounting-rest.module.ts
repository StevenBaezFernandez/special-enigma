import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AccountingController } from '../http/controllers/accounting.controller';
import { AccountingHealthController } from '../http/controllers/accounting-health.controller';

@Module({
  imports: [
    TerminusModule,
  ],
  controllers: [AccountingController, AccountingHealthController],
})
export class AccountingRestModule {}
