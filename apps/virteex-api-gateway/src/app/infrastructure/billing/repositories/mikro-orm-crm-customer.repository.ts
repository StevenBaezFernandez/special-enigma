import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Customer } from '@virteex/crm-domain';
import { CustomerRepository, CustomerBillingInfo } from '@virteex/billing-domain';

@Injectable()
export class MikroOrmCrmCustomerRepository implements CustomerRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<CustomerBillingInfo | null> {
    const customer = await this.em.findOne(Customer, { id });

    if (!customer) {
      return null;
    }

    return {
      id: customer.id,
      rfc: customer.taxId || 'XAXX010101000',
      legalName: customer.companyName || `${customer.firstName} ${customer.lastName}`.trim(),
      taxRegimen: customer.taxRegimen || '616',
      postalCode: customer.postalCode || '00000',
      email: customer.email || ''
    };
  }
}
