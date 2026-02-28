import { IsString, IsNumber, Min } from 'class-validator';

export class ReserveStockDto {
  @IsString()
  warehouseId!: string;

  @IsString()
  productSku!: string;

  @IsNumber()
  @Min(0.0001)
  quantity!: number;
}
