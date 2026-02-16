import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Customer } from '@virteex/crm-domain';
import { CustomerRepository, CustomerBillingInfo } from '@virteex/billing-domain';

@Injectable()
export class MikroOrmCrmCustomerRepository implements CustomerRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<CustomerBillingInfo | null> {
    // We access the Customer entity directly. In a strict microservices architecture,
    // this would be an HTTP call or Event sourcing.
    // In a modular monolith, shared database access via ORM is acceptable for performance
    // as long as we don't modify the entity here.
    const customer = await this.em.findOne(Customer, { id });

    if (!customer) {
      return null;
    }

    return {
      id: customer.id,
      rfc: customer.taxId || 'XAXX010101000', // Default generic RFC if missing
      legalName: customer.companyName || `${customer.firstName} ${customer.lastName}`.trim(),
      taxRegimen: customer.taxRegimen || '616', // Default 'Sin obligaciones fiscales'
      postalCode: customer.postalCode || '00000',
      email: customer.email || ''
    };
  }
}
