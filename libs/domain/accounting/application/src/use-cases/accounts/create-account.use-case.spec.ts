import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { CreateAccountUseCase } from './create-account.use-case';
import { type AccountRepository, Account, type OutboxRepository, type ITelemetryService } from '@virteex/domain-accounting-domain';
import { AccountType } from '@virteex/domain-accounting-contracts';

describe('CreateAccountUseCase', () => {
  let service: CreateAccountUseCase;
  let repo: AccountRepository;
  let outbox: OutboxRepository;

  let telemetry: ITelemetryService;

  beforeEach(() => {
    repo = {
      findByCode: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      transactional: vi.fn().mockImplementation((cb) => cb()),
    } as unknown as AccountRepository;
    outbox = {
      save: vi.fn(),
    } as unknown as OutboxRepository;
    telemetry = {
      recordBusinessMetric: vi.fn(),
      setTraceAttributes: vi.fn(),
    } as unknown as ITelemetryService;
    service = new CreateAccountUseCase(repo, outbox, telemetry);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an account', async () => {
    const dto = {
      tenantId: 'tenant1',
      code: '100',
      name: 'Assets',
      type: AccountType.ASSET,
    };

    (repo.findByCode as Mock).mockResolvedValue(null);
    (repo.create as Mock).mockImplementation((account: Account) => {
        const saved = Object.assign(Object.create(Object.getPrototypeOf(account)), account);
        saved.id = '1';
        return Promise.resolve(saved);
    });

    const result = await service.execute(dto);

    expect(repo.findByCode).toHaveBeenCalledWith('tenant1', '100');
    expect(repo.create).toHaveBeenCalled();
    expect(result.id).toBe('1');
    expect(result.code).toBe('100');
  });

  it('should create a child account', async () => {
      const parent = new Account('tenant1', '100', 'Assets', AccountType.ASSET as any);
      parent.id = '1';
      parent.level = 1;
      parent.isControl = true;

      const dto = {
        tenantId: 'tenant1',
        code: '101',
        name: 'Cash',
        type: AccountType.ASSET,
        parentId: '1'
      };

      (repo.findByCode as Mock).mockResolvedValue(null);
      (repo.findById as Mock).mockResolvedValue(parent);
      (repo.create as Mock).mockImplementation((account: Account) => {
          const saved = Object.assign(Object.create(Object.getPrototypeOf(account)), account);
          saved.id = '2';
          return Promise.resolve(saved);
      });

      const result = await service.execute(dto);

      expect(repo.findById).toHaveBeenCalledWith('tenant1', '1');
      expect(result.parentId).toBe('1');
      expect(result.level).toBe(2);
  });

  it('should throw error if account already exists', async () => {
    const dto = {
      tenantId: 'tenant1',
      code: '100',
      name: 'Assets',
      type: AccountType.ASSET,
    };

    (repo.findByCode as Mock).mockResolvedValue(new Account('tenant1', '100', 'Assets', AccountType.ASSET as unknown as any));

    await expect(service.execute(dto)).rejects.toThrow('Account with code 100 already exists');
  });

  it('should throw error if parent account belongs to different tenant', async () => {
      const parent = new Account('tenant2', '100', 'Assets', AccountType.ASSET as any);
      parent.id = '1';

      const dto = {
        tenantId: 'tenant1',
        code: '101',
        name: 'Cash',
        type: AccountType.ASSET,
        parentId: '1'
      };

      (repo.findByCode as Mock).mockResolvedValue(null);
      (repo.findById as Mock).mockResolvedValue(parent);

      await expect(service.execute(dto)).rejects.toThrow();
  });
});
