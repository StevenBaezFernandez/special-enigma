import { EntitySchema, Cascade } from '@mikro-orm/core';
import { BankAccount, CashFlow, Transaction } from '@virteex/domain-treasury-domain';

export const BankAccountSchema = new EntitySchema<BankAccount>({
  class: BankAccount,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    accountNumber: { type: 'string' },
    bankName: { type: 'string' },
    currency: { type: 'string' },
    balance: { type: 'string', default: '0' },
  },
});

export const CashFlowSchema = new EntitySchema<CashFlow>({
  class: CashFlow,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    date: { type: 'Date' },
    amount: { type: 'string' },
    type: { type: 'string' },
    category: { type: 'string' },
  },
});

export const TransactionSchema = new EntitySchema<Transaction>({
  class: Transaction,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    bankAccount: { kind: 'm:1', entity: 'BankAccount' },
    date: { type: 'Date' },
    amount: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string' },
  },
});
