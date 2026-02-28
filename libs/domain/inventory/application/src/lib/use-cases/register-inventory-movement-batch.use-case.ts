import { Injectable } from '@nestjs/common';
import { InventoryMovementType } from '@virteex/domain-inventory-domain';
import { RegisterMovementUseCase } from './register-movement.use-case';

export interface RegisterMovementBatchItemDto {
  productId: string;
  quantity: string;
  type: InventoryMovementType;
  reference: string;
  locationId?: string;
}

export interface RegisterInventoryMovementBatchDto {
  tenantId: string;
  warehouseId: string;
  items: RegisterMovementBatchItemDto[];
}

@Injectable()
export class RegisterInventoryMovementBatchUseCase {
  constructor(private readonly registerMovementUseCase: RegisterMovementUseCase) {}

  async execute(dto: RegisterInventoryMovementBatchDto): Promise<void> {
    for (const item of dto.items) {
      await this.registerMovementUseCase.execute({
        tenantId: dto.tenantId,
        warehouseId: dto.warehouseId,
        productId: item.productId,
        quantity: item.quantity,
        type: item.type,
        reference: item.reference,
        locationId: item.locationId,
      });
    }
  }
}
