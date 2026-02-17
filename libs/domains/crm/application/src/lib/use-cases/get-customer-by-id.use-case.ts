import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Customer, CustomerRepository } from '../../../../domain/src';

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly repository: CustomerRepository
  ) {}

  async execute(id: string): Promise<Customer> {
    const customer = await this.repository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    return customer;
  }
}
