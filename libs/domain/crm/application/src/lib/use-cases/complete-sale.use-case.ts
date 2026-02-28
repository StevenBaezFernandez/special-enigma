import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Sale, SaleRepository, SaleStatus } from '../../../../domain/src';

@Injectable()
export class CompleteSaleUseCase {
  constructor(
    @Inject('SaleRepository')
    private readonly repository: SaleRepository,
  ) {}

  async execute(id: string): Promise<Sale> {
    const sale = await this.repository.findById(id);
    if (!sale) {
        throw new NotFoundException('Sale not found');
    }
    if (sale.status !== SaleStatus.APPROVED) {
        throw new BadRequestException(`Cannot complete sale in status ${sale.status}. Must be APPROVED first.`);
    }
    sale.status = SaleStatus.COMPLETED;
    return this.repository.update(sale);
  }
}
