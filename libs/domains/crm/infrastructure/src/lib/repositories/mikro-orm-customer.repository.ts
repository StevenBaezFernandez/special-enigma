import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Customer, CustomerRepository } from '@virteex/domain-crm-domain';

@Injectable()
export class MikroOrmCustomerRepository implements CustomerRepository {
  constructor(private readonly em: EntityManager) {}

  async create(customer: Customer): Promise<Customer> {
    this.em.persist(customer);
    await this.em.flush();
    return customer;
  }

  async findAll(tenantId: string): Promise<Customer[]> {
    return this.em.find(Customer, { tenantId });
  }

  async findById(id: string): Promise<Customer | null> {
    return this.em.findOne(Customer, { id });
  }
}
