import { vi, describe, it, expect, beforeEach } from 'vitest';
import { JournalEntryRepositoryAdapter } from './journal-entry-repository-adapter';
import { JournalEntry, JournalEntryType, JournalEntryLine } from '@virteex/domain-accounting-domain';
import { EntityManager } from '@mikro-orm/knex';
import { DimensionValidator } from '@virteex/domain-accounting-application';

describe('JournalEntryRepositoryAdapter', () => {
  let repository: JournalEntryRepositoryAdapter;
  let em: EntityManager;
  let dimensionValidator: DimensionValidator;

  const mockEm = {
    persistAndFlush: vi.fn().mockResolvedValue(undefined),
    findOne: vi.fn(),
    find: vi.fn(),
    count: vi.fn(),
    createQueryBuilder: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        join: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue([])
    })
  };

  const mockDimensionValidator = {
    ensureValidKey: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    em = mockEm as unknown as EntityManager;
    dimensionValidator = mockDimensionValidator as unknown as DimensionValidator;
    repository = new JournalEntryRepositoryAdapter(em, dimensionValidator);
  });

  it('should create a journal entry', async () => {
    const entry = new JournalEntry('tenant-1', 'Test Entry', new Date());
    entry.type = JournalEntryType.REGULAR;

    const result = await repository.create(entry);

    expect(mockEm.persistAndFlush).toHaveBeenCalledWith(entry);
    expect(result).toBe(entry);
  });

  it('should count journal entries for a tenant', async () => {
    const tenantId = 'tenant-1';
    mockEm.count.mockResolvedValue(5);

    const result = await repository.count(tenantId);

    expect(mockEm.count).toHaveBeenCalledWith(JournalEntry, { tenantId });
    expect(result).toBe(5);
  });

  it('should get balances by account', async () => {
    const tenantId = 'tenant-1';
    const dimensions = { project: 'P1' };

    await repository.getBalancesByAccount(tenantId, undefined, undefined, dimensions);

    expect(mockDimensionValidator.ensureValidKey).toHaveBeenCalledWith('project');
    expect(mockEm.createQueryBuilder).toHaveBeenCalledWith(JournalEntryLine, 'l');
  });

  it('should find journal entry by id and tenantId', async () => {
    const tenantId = 'tenant-1';
    const entryId = 'entry-1';
    const mockEntry = { id: entryId, tenantId };

    mockEm.findOne.mockResolvedValue(mockEntry);

    const result = await repository.findById(tenantId, entryId);

    expect(mockEm.findOne).toHaveBeenCalledWith(
      JournalEntry,
      { id: entryId, tenantId },
      { populate: ['lines'] }
    );
    expect(result).toBe(mockEntry);
  });
});
