import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAccountUseCase } from './create-account.use-case';
import { ACCOUNT_REPOSITORY, AccountRepository, Account } from '@virteex/domain-accounting-domain';
import { AccountType } from '@virteex/domain-accounting-contracts';

describe('CreateAccountUseCase', () => {
  let service: CreateAccountUseCase;
  let repo: AccountRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAccountUseCase,
        {
          provide: ACCOUNT_REPOSITORY,
          useValue: {
            findByCode: vi.fn(),
            create: vi.fn(),
            findById: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreateAccountUseCase>(CreateAccountUseCase);
    repo = module.get<AccountRepository>(ACCOUNT_REPOSITORY);
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

    (repo.findByCode as jest.Mock).mockResolvedValue(null);
    (repo.create as jest.Mock).mockImplementation((account) => Promise.resolve({ ...account, id: '1' }));

    const result = await service.execute(dto);

    expect(repo.findByCode).toHaveBeenCalledWith('tenant1', '100');
    expect(repo.create).toHaveBeenCalled();
    expect(result.id).toBe('1');
    expect(result.code).toBe('100');
  });

  it('should create a child account', async () => {
      const parent = new Account('tenant1', '100', 'Assets', AccountType.ASSET);
      parent.id = '1';
      parent.level = 1;

      const dto = {
        tenantId: 'tenant1',
        code: '101',
        name: 'Cash',
        type: AccountType.ASSET,
        parentId: '1'
      };

      (repo.findByCode as jest.Mock).mockResolvedValue(null);
      (repo.findById as jest.Mock).mockResolvedValue(parent);
      (repo.create as jest.Mock).mockImplementation((account) => Promise.resolve({ ...account, id: '2' }));

      const result = await service.execute(dto);

      expect(repo.findById).toHaveBeenCalledWith('1');
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

    (repo.findByCode as jest.Mock).mockResolvedValue(new Account('tenant1', '100', 'Assets', AccountType.ASSET));

    await expect(service.execute(dto)).rejects.toThrow('Account with code 100 already exists');
  });

  it('should throw error if parent account belongs to different tenant', async () => {
      const parent = new Account('tenant2', '100', 'Assets', AccountType.ASSET);
      parent.id = '1';

      const dto = {
        tenantId: 'tenant1',
        code: '101',
        name: 'Cash',
        type: AccountType.ASSET,
        parentId: '1'
      };

      (repo.findByCode as jest.Mock).mockResolvedValue(null);
      (repo.findById as jest.Mock).mockResolvedValue(parent);

      await expect(service.execute(dto)).rejects.toThrow('Parent account 1 belongs to a different tenant');
  });
});
