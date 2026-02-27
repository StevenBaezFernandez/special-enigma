import { IsString, IsNumber, IsDateString } from 'class-validator';

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
