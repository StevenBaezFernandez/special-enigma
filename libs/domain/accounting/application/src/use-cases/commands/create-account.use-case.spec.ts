import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CreateAccountUseCase } from './create-account.use-case';
import { ACCOUNT_REPOSITORY, type AccountRepository, Account } from '@virteex/domain-accounting-domain';
import { AccountType } from '@virteex/domain-accounting-contracts';

describe('CreateAccountUseCase', () => {
  let service: CreateAccountUseCase;
  let repo: AccountRepository;

  beforeEach(() => {
    repo = {
      findByCode: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    } as unknown as AccountRepository;
    service = new CreateAccountUseCase(repo);
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

    (repo.findByCode as any).mockResolvedValue(null);
    (repo.create as any).mockImplementation((account: any) => Promise.resolve({ ...account, id: '1' }));

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

      const dto = {
        tenantId: 'tenant1',
        code: '101',
        name: 'Cash',
        type: AccountType.ASSET,
        parentId: '1'
      };

      (repo.findByCode as any).mockResolvedValue(null);
      (repo.findById as any).mockResolvedValue(parent);
      (repo.create as any).mockImplementation((account: any) => Promise.resolve({ ...account, id: '2' }));

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

    (repo.findByCode as any).mockResolvedValue(new Account('tenant1', '100', 'Assets', AccountType.ASSET as any));

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

      (repo.findByCode as any).mockResolvedValue(null);
      (repo.findById as any).mockResolvedValue(parent);

      await expect(service.execute(dto)).rejects.toThrow();
  });
});
