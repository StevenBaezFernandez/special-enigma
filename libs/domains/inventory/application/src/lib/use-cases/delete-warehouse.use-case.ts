import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { WarehouseRepository, WAREHOUSE_REPOSITORY } from '@virteex/domain-inventory-domain';

@Injectable()
export class DeleteWarehouseUseCase {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly warehouseRepository: WarehouseRepository
  ) {}

  async execute(id: string): Promise<void> {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    await this.warehouseRepository.delete(id);
  }
}
