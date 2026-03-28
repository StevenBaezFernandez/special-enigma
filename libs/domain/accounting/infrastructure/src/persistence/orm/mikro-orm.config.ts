import { defineConfig } from '@mikro-orm/postgresql';
import { AccountSchema, JournalEntrySchema, JournalEntryLineSchema, FiscalYearSchema, AccountingPolicySchema } from './mikro-orm.schemas';

export default defineConfig({
  entities: [AccountSchema, JournalEntrySchema, JournalEntryLineSchema, FiscalYearSchema, AccountingPolicySchema],
  dbName: process.env.ACCOUNTING_DB_NAME || 'virteex_accounting',
  host: process.env.ACCOUNTING_DB_HOST || 'localhost',
  port: Number(process.env.ACCOUNTING_DB_PORT) || 5432,
  user: process.env.ACCOUNTING_DB_USER || 'postgres',
  password: process.env.ACCOUNTING_DB_PASSWORD || 'postgres',
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: './libs/domain/accounting/infrastructure/src/lib/migrations',
    pathTs: './libs/domain/accounting/infrastructure/src/lib/migrations',
    transactional: true,
  },
});
