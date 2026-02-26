import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ProductionOrder,
  ProductionOrderComponent,
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

    // 4. BOM Explosion: Create ProductionOrderComponents based on bom.components
    for (const bomComponent of bom.components) {
        const requiredQty = Number(bomComponent.quantity) * dto.quantity;
        const orderComponent = new ProductionOrderComponent(order, bomComponent.componentProductSku, requiredQty);

        // Optional: Check stock for components too (Recursive validation)
        try {
            await this.inventoryService.checkAndReserveStock(dto.tenantId, dto.warehouseId, bomComponent.componentProductSku, requiredQty);
            orderComponent.reservedQuantity = requiredQty;
        } catch (e) {
            // Log but continue? Or fail the whole order?
            // In a strict ERP, we might fail or mark as 'PENDING_STOCK'
            console.warn(`Insufficient stock for component ${bomComponent.componentProductSku}`);
        }

        order.components.add(orderComponent);
    }

    await this.repository.save(order);
    return order;
  }
}
