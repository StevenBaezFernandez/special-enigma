import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Sale, SaleRepository, SaleStatus } from '../../../../domain/src';

@Injectable()
export class ApproveSaleUseCase {
  constructor(
    @Inject('SaleRepository')
    private readonly repository: SaleRepository,
  ) {}

  async execute(id: string): Promise<Sale> {
    const sale = await this.repository.findById(id);
    if (!sale) {
        throw new NotFoundException('Sale not found');
    }
    if (sale.status !== SaleStatus.DRAFT && sale.status !== SaleStatus.NEGOTIATION) {
        throw new BadRequestException(`Cannot approve sale in status ${sale.status}`);
    }
    sale.status = SaleStatus.APPROVED;
    return this.repository.update(sale);
  }
}
