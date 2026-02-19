import { defineConfig } from '@mikro-orm/postgresql';
import { ProductionOrder } from '@virteex/manufacturing-domain';
import { TenantModelSubscriber } from '@virteex/tenant';
import { getTenantContext } from '@virteex/auth';
import { join } from 'path';

export default defineConfig({
  entities: [ProductionOrder],
  subscribers: [new TenantModelSubscriber()],
  filters: {
    tenant: {
      cond: () => {
        const context = getTenantContext();
        return context ? { tenantId: context.tenantId } : {};
      },
      entity: ['ProductionOrder'],
      default: true,
    },
  },
  dbName: 'virteex_manufacturing',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: join(__dirname, '../migrations'),
    pathTs: join(__dirname, '../migrations'),
    transactional: true,
  },
});
