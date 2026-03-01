import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { Customer, CustomerRepository } from '@virteex/domain-crm-domain';

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    @Inject('CustomerRepository')
    private readonly repository: CustomerRepository
  ) {}

  async execute(id: string): Promise<Customer> {
    const customer = await this.repository.findById(id);
    if (!customer) {
      throw new DomainException(`Customer with id ${id} not found`, 'ENTITY_NOT_FOUND');
    }
    return customer;
  }
}
