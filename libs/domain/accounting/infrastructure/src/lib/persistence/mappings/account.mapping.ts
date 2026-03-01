import { EntitySchema } from '@mikro-orm/core';
import { Account } from '@virteex/domain-accounting-domain';
import { AccountType } from '@virteex/contracts-accounting-contracts';

export const AccountSchema = new EntitySchema<Account>({
  class: Account,
  uniques: [{ properties: ['tenantId', 'code'] }],
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    code: { type: 'string' },
    name: { type: 'string' },
    type: { enum: true, items: () => AccountType },
    parent: { reference: 'm:1', entity: () => Account, nullable: true },
    level: { type: 'number' },
    isControl: { type: 'boolean', default: false },
    currency: { type: 'string', nullable: true },
  },
});
