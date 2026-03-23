import { EntitySchema } from '@mikro-orm/core';
import { Account, JournalEntry, JournalEntryLine, FiscalYear, FiscalYearStatus, AccountingPolicy } from '@virteex/domain-accounting-domain';
import { AccountType, JournalEntryStatus } from '@virteex/domain-accounting-contracts';

export const AccountSchema = new EntitySchema<Account>({
  class: Account,
  uniques: [{ properties: ['tenantId', 'code'] }],
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string', index: true },
    code: { type: 'string' },
    name: { type: 'string' },
    type: { enum: true, items: () => AccountType },
    parent: { kind: 'm:1', entity: () => Account, nullable: true },
    level: { type: 'number' },
    isControl: { type: 'boolean', default: false },
    currency: { type: 'string', nullable: true },
  },
});

export const JournalEntrySchema = new EntitySchema<JournalEntry>({
  class: JournalEntry,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string', index: true },
    date: { type: 'date', index: true },
    description: { type: 'string' },
    status: { enum: true, items: () => JournalEntryStatus, default: JournalEntryStatus.DRAFT },
    lines: { kind: '1:m', entity: () => 'JournalEntryLine', mappedBy: 'journalEntry', orphanRemoval: true },
  },
});

export const JournalEntryLineSchema = new EntitySchema<JournalEntryLine>({
  class: JournalEntryLine,
  properties: {
    id: { primary: true, type: 'uuid' },
    journalEntry: { kind: 'm:1', entity: () => 'JournalEntry' },
    account: { kind: 'm:1', entity: () => Account },
    debit: { type: 'string', default: '0' },
    credit: { type: 'string', default: '0' },
    description: { type: 'string', nullable: true },
    currencyId: { type: 'string', nullable: true },
    amountCurrency: { type: 'string', nullable: true },
    exchangeRate: { type: 'string', nullable: true },
  },
});

export const FiscalYearSchema = new EntitySchema<FiscalYear>({
  class: FiscalYear,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string', index: true },
    year: { type: 'number' },
    status: { enum: true, items: () => FiscalYearStatus, default: FiscalYearStatus.OPEN },
    startDate: { type: 'date' },
    endDate: { type: 'date' },
  },
});

export const AccountingPolicySchema = new EntitySchema<AccountingPolicy>({
  class: AccountingPolicy,
  uniques: [{ properties: ['tenantId', 'type'] }],
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string', index: true },
    type: { type: 'string' },
    rules: { type: 'json' },
  },
});
