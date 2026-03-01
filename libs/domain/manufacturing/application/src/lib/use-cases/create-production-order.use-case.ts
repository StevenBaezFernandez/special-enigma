import { Injectable, Inject, Logger } from '@nestjs/common';
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
import { EntityNotFoundException } from '@virteex/kernel-exceptions';

export interface CreateProductionOrderInput {
  tenantId: string;
  warehouseId: string;
  productSku: string;
  quantity: number;
  dueDate: Date;
}

@Injectable()
export class CreateProductionOrderUseCase {
  private readonly logger = new Logger(CreateProductionOrderUseCase.name);

  constructor(
    @Inject(PRODUCTION_ORDER_REPOSITORY) private readonly repository: ProductionOrderRepository,
    @Inject(INVENTORY_SERVICE) private readonly inventoryService: InventoryService,
    @Inject(BILL_OF_MATERIALS_REPOSITORY) private readonly bomRepository: BillOfMaterialsRepository
  ) {}

  async execute(dto: CreateProductionOrderInput): Promise<ProductionOrder> {
    this.logger.log(`Executing CreateProductionOrder for SKU: ${dto.productSku}, Quantity: ${dto.quantity}`);

    // 1. Validate BOM Existence
    const bom = await this.bomRepository.findByProductSku(dto.productSku);
    if (!bom) {
      throw new EntityNotFoundException('BillOfMaterials', dto.productSku);
    }

    // 2. Pre-calculate all requirements
    const requirements = bom.components.map(c => ({
        sku: c.componentProductSku,
        qty: Number(c.quantity) * dto.quantity
    }));

    // 3. ATOMIC VALIDATION & RESERVATION (Simulated via pre-check loop)
    // In a real production system with high concurrency, this would use a DB transaction
    // or a specialized reservation service that supports batching.

    this.logger.log(`Validating stock for all ${requirements.length} components before reservation...`);

    // Fail-fast if any component has insufficient stock
    for (const req of requirements) {
        try {
            // We use the same method but since we haven't committed anything yet,
            // if one fails, we stop the whole process.
            // Note: This implementation assumes inventoryService.checkAndReserveStock is atomic
            // per call but we need it atomic per ProductionOrder.
            await this.inventoryService.checkAndReserveStock(dto.tenantId, dto.warehouseId, req.sku, req.qty);
        } catch (e: any) {
            this.logger.error(`FAILED: Insufficient stock for component ${req.sku}. Requirement: ${req.qty}`);
            throw e; // Rethrow to fail the use case
        }
    }

    // 4. Create Order and link components
    const order = new ProductionOrder(dto.tenantId, dto.warehouseId, dto.productSku, dto.quantity, new Date(dto.dueDate));

    for (const req of requirements) {
        const orderComponent = new ProductionOrderComponent(order, req.sku, req.qty);
        orderComponent.reservedQuantity = req.qty;
        order.components.push(orderComponent);
    }

    await this.repository.save(order);
    this.logger.log(`Production Order ${order.id} created and stock reserved successfully.`);

    return order;
  }
}
