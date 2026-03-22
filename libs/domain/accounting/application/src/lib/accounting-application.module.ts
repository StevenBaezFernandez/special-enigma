import { Module } from '@nestjs/common';
import { AccountingPolicyService } from './services/accounting-policy.service';
import { AccountingEventHandlerService } from './services/accounting-event-handler.service';
import { AccountingListener } from './listeners/accounting.listener';

@Module({
  imports: [],
  providers: [
    AccountingPolicyService,
    AccountingEventHandlerService,
    AccountingListener
  ],
  exports: [
    AccountingPolicyService,
    AccountingEventHandlerService
  ],
})
export class AccountingApplicationModule {}
