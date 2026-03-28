import { Customer } from '../entities/customer.entity';

export interface CustomerRepository {
  create(customer: Customer): Promise<Customer>;
  findAll(tenantId: string): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
}
