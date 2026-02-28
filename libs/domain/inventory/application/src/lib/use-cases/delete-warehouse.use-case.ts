import { Injectable, Inject } from '@nestjs/common';
import { WarehouseRepository, WAREHOUSE_REPOSITORY, WarehouseNotFoundError } from '@virteex/domain-inventory-domain';

@Injectable()
export class DeleteWarehouseUseCase {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    private readonly warehouseRepository: WarehouseRepository
  ) {}

  async execute(id: string): Promise<void> {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new WarehouseNotFoundError(id);
    }
    await this.warehouseRepository.delete(id);
  }
}
