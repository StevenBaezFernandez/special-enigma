import { Module, Global } from '@nestjs/common';
import { EntitlementService } from './entitlement.service';
import { EntitlementGuard } from './entitlement.guard';
import { SubscriptionDomainModule } from '@virteex/domain-subscription-domain';

@Global()
@Module({
  imports: [],
  providers: [EntitlementService, EntitlementGuard],
  exports: [EntitlementService, EntitlementGuard],
})
export class EntitlementsModule {}
