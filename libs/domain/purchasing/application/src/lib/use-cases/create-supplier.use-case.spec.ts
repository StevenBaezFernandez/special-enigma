import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateSupplierUseCase } from './create-supplier.use-case';
import { SUPPLIER_REPOSITORY } from '@virteex/domain-purchasing-domain';
import { CreateSupplierDto, SupplierType as ContractSupplierType } from '@virteex/domain-purchasing-contracts';

describe('CreateSupplierUseCase', () => {
  let useCase: CreateSupplierUseCase;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      findByTaxId: vi.fn(),
      save: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSupplierUseCase,
        { provide: SUPPLIER_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateSupplierUseCase>(CreateSupplierUseCase);
  });

  it('should create a supplier', async () => {
    mockRepo.findByTaxId.mockResolvedValue(null);
    const dto: CreateSupplierDto = {
        name: 'Test',
        taxId: '123',
        type: ContractSupplierType.LEGAL
    };
    const result = await useCase.execute(dto, 'tenant-1');
    expect(result.name).toBe('Test');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should throw if supplier exists', async () => {
      mockRepo.findByTaxId.mockResolvedValue({});
      const dto: CreateSupplierDto = {
          name: 'Test',
          taxId: '123',
          type: ContractSupplierType.LEGAL
      };
      await expect(useCase.execute(dto, 'tenant-1')).rejects.toThrow();
  });
});
