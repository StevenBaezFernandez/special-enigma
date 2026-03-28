import { EntitySchema } from '@mikro-orm/core';
import { Customer } from '@virteex/domain-crm-domain';
import { CustomerType } from '@virteex/shared-contracts';

export const CustomerSchema = new EntitySchema<Customer>({
  class: Customer,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    type: { enum: true, items: () => CustomerType, default: CustomerType.COMPANY },
    firstName: { type: 'string', nullable: true },
    lastName: { type: 'string', nullable: true },
    companyName: { type: 'string', nullable: true },
    email: { type: 'string', nullable: true },
    phone: { type: 'string', nullable: true },
    taxId: { type: 'string', nullable: true },
    taxRegimen: { type: 'string', nullable: true },
    contactPerson: { type: 'string', nullable: true },
    address: { type: 'string', nullable: true },
    city: { type: 'string', nullable: true },
    stateOrProvince: { type: 'string', nullable: true },
    postalCode: { type: 'string', nullable: true },
    country: { type: 'string', nullable: true },
    opportunities: { kind: '1:m', entity: 'Opportunity', mappedBy: 'customer', cascade: ['all' as any] },
    createdAt: { type: 'Date', onCreate: () => new Date() },
    updatedAt: { type: 'Date', onCreate: () => new Date(), onUpdate: () => new Date() },
  },
  hooks: {
    beforeCreate: [(ent  : any) => ent.validateTaxId()],
    beforeUpdate: [(ent  : any) => ent.validateTaxId()],
  },
});
