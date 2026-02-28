import { Injectable, Inject } from '@nestjs/common';
import { SalesPort, TopProductDto } from '@virteex/domain-bi-domain';
import { SaleRepository } from '@virteex/domain-crm-domain';

@Injectable()
export class CrmSalesAdapter implements SalesPort {
  constructor(
    @Inject('SaleRepository') private readonly saleRepository: SaleRepository
  ) {}

  async getTopProducts(tenantId: string, limit: number): Promise<TopProductDto[]> {
    // The SaleRepository from CRM Domain returns { name: string; value: number }[]
    // TopProductDto is likely similar.
    return this.saleRepository.getTopProducts(tenantId, limit);
  }
}
