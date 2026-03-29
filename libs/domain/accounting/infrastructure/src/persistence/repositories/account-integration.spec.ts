import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { MikroORM } from '@mikro-orm/postgresql';
import { Account } from '../../../../domain/src/entities/account.entity';
import { AccountType } from '@virteex/domain-accounting-contracts';
import { AccountSchema, JournalEntrySchema, JournalEntryLineSchema, FiscalYearSchema, AccountingPolicySchema } from '../orm/mikro-orm.schemas';
import { MikroOrmAccountRepository } from './mikro-orm-account.repository';

describe('MikroOrmAccountRepository Integration', () => {
  let container: StartedPostgreSqlContainer;
  let orm: MikroORM;
  let repository: MikroOrmAccountRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();

    orm = await MikroORM.init({
      entities: [AccountSchema, JournalEntrySchema, JournalEntryLineSchema, FiscalYearSchema, AccountingPolicySchema],
      dbName: container.getDatabase(),
      host: container.getHost(),
      port: container.getPort(),
      user: container.getUsername(),
      password: container.getPassword(),
      debug: false,
    });

    const generator = orm.getSchemaGenerator();
    await generator.createSchema();

    repository = new MikroOrmAccountRepository(orm.em.fork());
  }, 60000);

  afterAll(async () => {
    if (orm) await orm.close(true);
    if (container) await container.stop();
  });

  it('should persist and retrieve an account using a real database', async () => {
    const tenantId = 'tenant-integration-test';
    const account = new Account(tenantId, '101', 'Cash', AccountType.ASSET);
    account.id = '00000000-0000-0000-0000-000000000001';

    await repository.create(account);

    const found = await repository.findByCode(tenantId, '101');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Cash');
    expect(found?.id).toBe(account.id);
  });

  it('should find all accounts for a tenant in a real database', async () => {
    const tenantId = 'tenant-list-test';
    const acc1 = new Account(tenantId, '101', 'Cash', AccountType.ASSET);
    acc1.id = '00000000-0000-0000-0000-000000000002';
    const acc2 = new Account(tenantId, '102', 'Bank', AccountType.ASSET);
    acc2.id = '00000000-0000-0000-0000-000000000003';

    await repository.create(acc1);
    await repository.create(acc2);

    const accounts = await repository.findAll(tenantId);
    expect(accounts).toHaveLength(2);
    expect(accounts.map(a => a.code)).toContain('101');
    expect(accounts.map(a => a.code)).toContain('102');
  });
});
