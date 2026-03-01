import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { Sale, SaleRepository, SaleStatus } from '@virteex/domain-crm-domain';

@Injectable()
export class ApproveSaleUseCase {
  constructor(
    @Inject('SaleRepository')
    private readonly repository: SaleRepository,
  ) {}

  async execute(id: string): Promise<Sale> {
    const sale = await this.repository.findById(id);
    if (!sale) {
        throw new DomainException('Sale not found', 'ENTITY_NOT_FOUND');
    }
    if (sale.status !== SaleStatus.DRAFT && sale.status !== SaleStatus.NEGOTIATION) {
        throw new DomainException(`Cannot approve sale in status ${sale.status}`, 'BAD_REQUEST');
    }
    sale.status = SaleStatus.APPROVED;
    return this.repository.update(sale);
  }
}
