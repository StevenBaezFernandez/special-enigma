import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductionOrderUseCase, CreateProductionOrderDto } from './create-production-order.use-case';
import {
  PRODUCTION_ORDER_REPOSITORY,
  INVENTORY_SERVICE,
  BILL_OF_MATERIALS_REPOSITORY,
  ProductionOrderRepository,
  InventoryService,
  BillOfMaterialsRepository,
  BillOfMaterials
} from '@virteex/domain-manufacturing-domain';
import { NotFoundException } from '@nestjs/common';

describe('CreateProductionOrderUseCase', () => {
  let useCase: CreateProductionOrderUseCase;
  let productionOrderRepo: jest.Mocked<ProductionOrderRepository>;
  let inventoryService: jest.Mocked<InventoryService>;
  let bomRepo: jest.Mocked<BillOfMaterialsRepository>;

  beforeEach(async () => {
    productionOrderRepo = {
      save: vi.fn(),
      findAll: vi.fn(),
    } as any;

    inventoryService = {
      checkAndReserveStock: vi.fn(),
    } as any;

    bomRepo = {
      findByProductSku: vi.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductionOrderUseCase,
        { provide: PRODUCTION_ORDER_REPOSITORY, useValue: productionOrderRepo },
        { provide: INVENTORY_SERVICE, useValue: inventoryService },
        { provide: BILL_OF_MATERIALS_REPOSITORY, useValue: bomRepo },
      ],
    }).compile();

    useCase = module.get<CreateProductionOrderUseCase>(CreateProductionOrderUseCase);
  });

  it('should create production order when BOM exists', async () => {
    const dto: CreateProductionOrderDto = {
      tenantId: 'tenant1',
      warehouseId: 'wh1',
      productSku: 'SKU123',
      quantity: 10,
      dueDate: new Date(),
    };

    bomRepo.findByProductSku.mockResolvedValue({ id: 'bom1' } as BillOfMaterials);
    inventoryService.checkAndReserveStock.mockResolvedValue();

    const result = await useCase.execute(dto);

    expect(bomRepo.findByProductSku).toHaveBeenCalledWith('SKU123');
    expect(inventoryService.checkAndReserveStock).toHaveBeenCalledWith('tenant1', 'wh1', 'SKU123', 10);
    expect(productionOrderRepo.save).toHaveBeenCalled();
    expect(result.productSku).toBe('SKU123');
  });

  it('should throw NotFoundException when BOM does not exist', async () => {
    const dto: CreateProductionOrderDto = {
      tenantId: 'tenant1',
      warehouseId: 'wh1',
      productSku: 'SKU123',
      quantity: 10,
      dueDate: new Date(),
    };

    bomRepo.findByProductSku.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    expect(inventoryService.checkAndReserveStock).not.toHaveBeenCalled();
    expect(productionOrderRepo.save).not.toHaveBeenCalled();
  });
});
