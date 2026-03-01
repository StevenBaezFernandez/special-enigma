import { EntitySchema } from '@mikro-orm/core';
import { TaxRule } from '@virteex/domain-billing-domain';
import { PaymentMethod } from '@virteex/domain-billing-domain';
import { TaxLine } from '@virteex/domain-billing-domain';

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
    name: { type: 'string' },
    code: { type: 'string' },
    provider: { type: 'string' },
    isActive: { type: 'boolean', default: true },
  },
});

export const TaxLineSchema = new EntitySchema<TaxLine>({
  class: TaxLine,
  properties: {
    id: { primary: true, type: 'uuid' },
    taxType: { type: 'string' },
    rate: { type: 'string' },
    amount: { type: 'string' },
    base: { type: 'string' },
  },
});
