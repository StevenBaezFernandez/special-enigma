import { EntitySchema } from '@mikro-orm/core';
import { TaxRule, PaymentMethod, TaxLine } from '@virteex/domain-billing-domain';

export const TaxRuleSchema = new EntitySchema<TaxRule>({
  class: TaxRule,
  properties: {
    id: { primary: true, type: 'uuid' },
    jurisdiction: { type: 'string' },
    taxType: { type: 'string' },
    rate: { type: 'string' },
    validFrom: { type: 'Date' },
    validTo: { type: 'Date', nullable: true },
    condition: { type: 'string', nullable: true },
  },
});

export const PaymentMethodSchema = new EntitySchema<PaymentMethod>({
  class: PaymentMethod,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    type: { type: 'string' },
    last4: { type: 'string' },
    expiryDate: { type: 'string' },
    isDefault: { type: 'boolean', default: false },
    createdAt: { type: 'Date', onCreate: () => new Date() },
    updatedAt: { type: 'Date', onCreate: () => new Date(), onUpdate: () => new Date() },
  },
});

export const TaxLineSchema = new EntitySchema<TaxLine>({
  class: TaxLine,
  properties: {
    id: { primary: true, type: 'uuid' },
    taxName: { type: 'string' },
    rate: { type: 'string' },
    amount: { type: 'string' },
  },
});
