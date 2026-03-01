import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { Sale, SaleRepository, SaleStatus } from '@virteex/domain-crm-domain';

@Injectable()
export class CancelSaleUseCase {
  constructor(
    @Inject('SaleRepository')
    private readonly repository: SaleRepository,
  ) {}

  async execute(id: string): Promise<Sale> {
    const sale = await this.repository.findById(id);
    if (!sale) {
        throw new DomainException('Sale not found', 'ENTITY_NOT_FOUND');
    }
    if (sale.status === SaleStatus.COMPLETED) {
        throw new DomainException(`Cannot cancel completed sale`, 'BAD_REQUEST');
    }
    sale.status = SaleStatus.CANCELLED;
    return this.repository.update(sale);
  }
}
