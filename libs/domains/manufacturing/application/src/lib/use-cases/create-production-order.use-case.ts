import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ProductionOrder,
  ProductionOrderRepository,
  PRODUCTION_ORDER_REPOSITORY,
  InventoryService,
  INVENTORY_SERVICE,
  BillOfMaterialsRepository,
  BILL_OF_MATERIALS_REPOSITORY
} from '@virteex/domain-manufacturing-domain';
import { IsString, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CreateProductionOrderDto {
  @IsString()
  tenantId!: string;

  @IsString()
  warehouseId!: string;

  @IsString()
  productSku!: string;

  @IsNumber()
  quantity!: number;

  @IsDateString()
  dueDate!: Date;
}

@Injectable()
export class CreateProductionOrderUseCase {
  constructor(
    @Inject(PRODUCTION_ORDER_REPOSITORY) private readonly repository: ProductionOrderRepository,
    @Inject(INVENTORY_SERVICE) private readonly inventoryService: InventoryService,
    @Inject(BILL_OF_MATERIALS_REPOSITORY) private readonly bomRepository: BillOfMaterialsRepository
  ) {}

  async execute(dto: CreateProductionOrderDto): Promise<ProductionOrder> {
    // 1. Validate BOM Existence (Robustness)
    const bom = await this.bomRepository.findByProductSku(dto.productSku);
    if (!bom) {
      throw new NotFoundException(`No active Bill of Materials (BOM) found for product SKU: ${dto.productSku}`);
    }

    // 2. Check and Reserve Stock (Existing Logic)
    await this.inventoryService.checkAndReserveStock(dto.tenantId, dto.warehouseId, dto.productSku, dto.quantity);

    // 3. Create Order
    const order = new ProductionOrder(dto.tenantId, dto.warehouseId, dto.productSku, dto.quantity, new Date(dto.dueDate));

    // Future: We could explode the BOM here and create ProductionOrderComponents based on bom.components

    await this.repository.save(order);
    return order;
  }
}
