import { Injectable, Inject } from '@nestjs/common';
import { Customer, CustomerRepository } from '../../../../domain/src';

@Injectable()
export class ListCustomersUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly repository: CustomerRepository
  ) {}

  async execute(tenantId: string): Promise<Customer[]> {
    return this.repository.findAll(tenantId);
  }
}
