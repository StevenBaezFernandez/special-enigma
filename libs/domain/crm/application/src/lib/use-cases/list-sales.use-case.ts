import { Injectable, Inject } from '@nestjs/common';
import { Sale, SaleRepository } from '../../../../domain/src';

@Injectable()
export class ListSalesUseCase {
  constructor(
    @Inject('SaleRepository')
    private readonly repository: SaleRepository
  ) {}

  async execute(tenantId: string): Promise<Sale[]> {
    return this.repository.findAll(tenantId);
  }
}
