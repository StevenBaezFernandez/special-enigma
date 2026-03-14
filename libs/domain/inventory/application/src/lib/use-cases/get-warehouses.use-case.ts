import { Inject, Injectable } from '@nestjs/common';
import { WAREHOUSE_REPOSITORY, type WarehouseRepository } from '@virteex/domain-inventory-domain';
import { WarehouseDto } from '@virteex/domain-inventory-contracts';

@Injectable()
export class GetWarehousesUseCase {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY)
    private warehouseRepository: WarehouseRepository,
  ) {}

  async execute(tenantId: string): Promise<WarehouseDto[]> {
    const warehouses = await this.warehouseRepository.findAll(tenantId);
    return warehouses.map((w) => ({
      id: w.id,
      name: w.name,
      location: w.address || '',
      tenantId: w.tenantId,
    }));
  }
}
