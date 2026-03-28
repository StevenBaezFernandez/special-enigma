import { Injectable, Inject } from '@nestjs/common';
import { type SalesPort, type TopProductDto } from '@virteex/domain-bi-domain';

@Injectable()
export class CrmSalesAdapter implements SalesPort {
  constructor(
    @Inject('SaleRepository') private readonly saleRepository  : any
  ) {}

  async getTopProducts(tenantId: string, limit: number): Promise<TopProductDto[]> {
    return this.saleRepository.getTopProducts(tenantId, limit);
  }
}
