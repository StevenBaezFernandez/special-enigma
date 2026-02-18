import { Module } from '@nestjs/common';
import { AccountingApplicationModule } from '@virteex/accounting-application';
import { AccountingInfrastructureModule } from '@virteex/accounting-infrastructure';
import { AccountingController } from './controllers/accounting.controller';
import { AccountingEventsController } from './controllers/accounting-events.controller';

@Module({
  imports: [AccountingApplicationModule, AccountingInfrastructureModule],
  controllers: [AccountingController, AccountingEventsController],
  providers: [],
})
export class AccountingPresentationModule {}
