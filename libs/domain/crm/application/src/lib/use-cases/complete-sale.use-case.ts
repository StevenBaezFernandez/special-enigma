import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { Sale, SaleRepository, SaleStatus } from '@virteex/domain-crm-domain';

@Injectable()
export class CompleteSaleUseCase {
  constructor(
    @Inject('SaleRepository')
    private readonly repository: SaleRepository,
  ) {}

  async execute(id: string): Promise<Sale> {
    const sale = await this.repository.findById(id);
    if (!sale) {
        throw new DomainException('Sale not found', 'ENTITY_NOT_FOUND');
    }
    if (sale.status !== SaleStatus.APPROVED) {
        throw new DomainException(`Cannot complete sale in status ${sale.status}. Must be APPROVED first.`, 'BAD_REQUEST');
    }
    sale.status = SaleStatus.COMPLETED;
    return this.repository.update(sale);
  }
}
