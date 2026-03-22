import { Injectable, Inject } from '@nestjs/common';
import { Invoice, InvoiceItem, type InvoiceRepository, INVOICE_REPOSITORY, type ProductRepository, PRODUCT_REPOSITORY, TaxCalculatorService, TENANT_CONFIG_REPOSITORY, type TenantConfigRepository } from '@virteex/domain-billing-domain';
import { DomainException } from '@virteex/shared-util-server-server-config';
import { CreateInvoiceDto } from '../dtos/create-invoice.dto';
import { Decimal } from 'decimal.js';
import { SUBSCRIPTION_REPOSITORY, type SubscriptionRepository } from '@virteex/domain-subscription-domain';
import { INVOICE_INTEGRATION_PUBLISHER, type InvoiceIntegrationPublisherPort } from '../ports/invoice-integration-publisher.port';
import { PriceValidationPolicy } from '../services/price-validation.policy';
import { InvoiceStampingOrchestrator } from '../services/invoice-stamping.orchestrator';

@Injectable()
export class CreateInvoiceUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
    @Inject(TENANT_CONFIG_REPOSITORY) private readonly tenantConfigRepository: TenantConfigRepository,
    private readonly taxCalculatorService: TaxCalculatorService,
    private readonly priceValidationPolicy: PriceValidationPolicy,
    private readonly stampingOrchestrator: InvoiceStampingOrchestrator,
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(INVOICE_INTEGRATION_PUBLISHER)
    private readonly integrationPublisher: InvoiceIntegrationPublisherPort
  ) {}

  async execute(dto: CreateInvoiceDto): Promise<Invoice> {
    const tenantId = dto.tenantId;

    if (!tenantId || tenantId === 'default-tenant') {
      throw new DomainException('Valid Tenant ID is required', 'TENANT_REQUIRED');
    }

    const subscription = await this.subscriptionRepository.findByTenantId(tenantId);
    const limit = subscription?.getPlan()?.limits?.invoices ?? 10;
    if (limit !== -1) {
      const currentCount = await this.invoiceRepository.countByTenantId(tenantId);
      if (currentCount >= limit) {
        throw new DomainException(`Invoice limit reached for tenant ${tenantId}. Upgrade plan to continue.`, 'PLAN_LIMIT_REACHED');
      }
    }

    const tenantConfig = await this.tenantConfigRepository.getFiscalConfig(tenantId);
    const jurisdiction = tenantConfig.country || 'MX';

    const invoice = new Invoice(tenantId, dto.customerId, '0', '0');
    invoice.dueDate = new Date(dto.dueDate);
    invoice.paymentForm = dto.paymentForm;
    invoice.paymentMethod = dto.paymentMethod;
    invoice.usage = dto.usage;

    for (const itemDto of dto.items) {
      const price = await this.priceValidationPolicy.resolvePrice(
        this.productRepository,
        itemDto.productId,
        itemDto.unitPrice
      );
      const qty = new Decimal(itemDto.quantity);
      const amount = qty.times(price);
      const taxResult = await this.taxCalculatorService.calculateTax(amount.toNumber(), jurisdiction);
      const tax = new Decimal(taxResult.totalTax);

      const item = new InvoiceItem(
        itemDto.description,
        itemDto.quantity,
        price.toFixed(2),
        amount.toFixed(2),
        tax.toFixed(2)
      );
      item.productId = itemDto.productId;

      invoice.addItem(item);
    }

    invoice.markPendingStamp();
    await this.invoiceRepository.save(invoice);

    await this.stampingOrchestrator.stamp(invoice);

    await this.integrationPublisher.publishInvoiceStamped(invoice);

    await this.invoiceRepository.save(invoice);

    return invoice;
  }

}
