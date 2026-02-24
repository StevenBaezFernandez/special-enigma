import { Inject, Injectable } from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import {
  WAREHOUSE_REPOSITORY,
  WarehouseRepository,
  Warehouse
} from '@virteex/domain-inventory-domain';

export class CreateWarehouseDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

@Injectable()
export class CreateWarehouseUseCase {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY) private readonly warehouseRepo: WarehouseRepository
  ) {}

  async execute(dto: CreateWarehouseDto): Promise<Warehouse> {
    const existing = await this.warehouseRepo.findByCode(dto.code, dto.tenantId);
    if (existing) {
      throw new Error('Warehouse code already exists');
    }

    const warehouse = new Warehouse(dto.tenantId, dto.code, dto.name);
    if (dto.description) {
      warehouse.description = dto.description;
    }

    await this.warehouseRepo.save(warehouse);
    return warehouse;
  }
}
