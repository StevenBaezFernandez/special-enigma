import { Injectable, Inject } from '@nestjs/common';
import { type WarehouseRepository, WAREHOUSE_REPOSITORY, Warehouse, WarehouseNotFoundError } from '@virteex/domain-inventory-domain';

export interface UpdateWarehouseDto {
  id: string;
  name?: string;
  code?: string;
  address?: string;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class UpdateWarehouseUseCase {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly warehouseRepository: WarehouseRepository
  ) {}

  async execute(dto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findById(dto.id);
    if (!warehouse) {
      throw new WarehouseNotFoundError(dto.id);
    }

    if (dto.name) warehouse.rename(dto.name);
    if (dto.code) warehouse.recode(dto.code);
    if (dto.address !== undefined) warehouse.changeAddress(dto.address);
    if (dto.description !== undefined) warehouse.changeDescription(dto.description);
    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        warehouse.activate();
      } else {
        warehouse.deactivate();
      }
    }

    await this.warehouseRepository.save(warehouse);
    return warehouse;
  }
}
