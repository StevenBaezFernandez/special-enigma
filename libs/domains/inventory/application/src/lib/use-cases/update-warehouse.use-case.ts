import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { WarehouseRepository, WAREHOUSE_REPOSITORY, Warehouse } from '@virteex/domain-inventory-domain';

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
      throw new NotFoundException(`Warehouse with ID ${dto.id} not found`);
    }

    if (dto.name) warehouse.name = dto.name;
    if (dto.code) warehouse.code = dto.code;
    if (dto.address !== undefined) warehouse.address = dto.address;
    if (dto.description !== undefined) warehouse.description = dto.description;
    if (dto.isActive !== undefined) warehouse.isActive = dto.isActive;

    await this.warehouseRepository.save(warehouse);
    return warehouse;
  }
}
