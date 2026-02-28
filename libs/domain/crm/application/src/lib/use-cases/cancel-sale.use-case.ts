import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Sale, SaleRepository, SaleStatus } from '../../../../domain/src';

@Injectable()
export class CancelSaleUseCase {
  constructor(
    @Inject('SaleRepository')
    private readonly repository: SaleRepository,
  ) {}

  async execute(id: string): Promise<Sale> {
    const sale = await this.repository.findById(id);
    if (!sale) {
        throw new NotFoundException('Sale not found');
    }
    if (sale.status === SaleStatus.COMPLETED) {
        throw new BadRequestException(`Cannot cancel completed sale`);
    }
    sale.status = SaleStatus.CANCELLED;
    return this.repository.update(sale);
  }
}
