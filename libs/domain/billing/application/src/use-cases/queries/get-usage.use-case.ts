import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type InvoiceRepository, INVOICE_REPOSITORY } from '@virteex/domain-billing-domain';
import { type SubscriptionRepository, SUBSCRIPTION_REPOSITORY, SubscriptionPlan } from '@virteex/domain-subscription-domain';

export interface UsageItem {
  resource: string;
  used: number;
  limit: number;
  type: string;
  isUnlimited: boolean;
  isEnabled: boolean;
}

@Injectable()
export class GetUsageUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository,
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepository: SubscriptionRepository,
    private readonly configService: ConfigService
  ) {}

  async execute(tenantId: string): Promise<UsageItem[]> {
    const invoiceCount = await this.invoiceRepository.countByTenantId(tenantId);
    const subscription = await this.subscriptionRepository.findByTenantId(tenantId);

    // Default Limits if no subscription (e.g., Free Tier or Trial fallback)
    // Configuration allows changing these without recompilation
    let limits = {
      invoices: this.configService.get<number>('DEFAULT_INVOICE_LIMIT', 10),
      users: this.configService.get<number>('DEFAULT_USER_LIMIT', 1),
      storage: this.configService.get<number>('DEFAULT_STORAGE_LIMIT', 50)
    };

    if (subscription && subscription.isValid() && subscription.getPlan()) {
       limits = subscription.getPlan().limits;
    }

    const isUnlimited = limits.invoices === -1;

    return [{
      resource: 'Invoices',
      used: invoiceCount,
      limit: isUnlimited ? Infinity : limits.invoices,
      type: 'numeric',
      isUnlimited: isUnlimited,
      isEnabled: true
    }];
  }
}
