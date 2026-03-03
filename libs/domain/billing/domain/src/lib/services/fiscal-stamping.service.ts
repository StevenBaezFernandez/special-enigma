import { BadRequestException, EntityNotFoundException } from '@virteex/kernel-exceptions';
import { Invoice } from '../entities/invoice.entity';
import { FiscalStamp } from '../ports/pac-provider.port';
import { TenantConfigRepository, TenantFiscalConfig } from '../ports/tenant-config.port';
import { CustomerRepository, CustomerBillingInfo } from '../ports/customer.repository';
import { PacStrategyFactory } from '../ports/pac-strategy.factory';
import { FiscalDocumentBuilderFactory } from '@virteex/domain-fiscal-domain';

export class FiscalStampingService {
  constructor(
    private readonly pacStrategyFactory: PacStrategyFactory,
    private readonly tenantConfigRepo: TenantConfigRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly documentBuilderFactory: FiscalDocumentBuilderFactory
  ) {}

  async stampInvoice(invoice: Invoice): Promise<FiscalStamp> {
    const tenantConfig = await this.tenantConfigRepo.getFiscalConfig(invoice.tenantId);
    if (!tenantConfig.rfc || !tenantConfig.postalCode) {
         if (tenantConfig.country === 'MX' && !tenantConfig.regime) {
             throw new BadRequestException('Tenant fiscal configuration is incomplete (RFC, Postal Code, Regime are required for MX)');
         }
         if (tenantConfig.country === 'US' && !tenantConfig.legalName) {
             throw new BadRequestException('Tenant fiscal configuration is incomplete (Legal Name required for US)');
         }
    }

    const customer = await this.customerRepo.findById(invoice.customerId);
    if (!customer) {
        throw new EntityNotFoundException('Customer', invoice.customerId);
    }

    const builder = this.documentBuilderFactory.getBuilder(tenantConfig.country);
    const document = await builder.build(invoice, tenantConfig, customer);

    const provider = this.pacStrategyFactory.getProvider(tenantConfig.country);
    return await provider.stamp(document);
  }

  async cancelInvoice(uuid: string, tenantId: string): Promise<boolean> {
    const tenantConfig = await this.tenantConfigRepo.getFiscalConfig(tenantId);
    const provider = this.pacStrategyFactory.getProvider(tenantConfig.country);
    return await provider.cancel(uuid, tenantConfig.rfc);
  }
}
