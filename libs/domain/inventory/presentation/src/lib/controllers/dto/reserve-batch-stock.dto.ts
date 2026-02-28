import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ReserveStockDto } from './reserve-stock.dto';

export class ReserveBatchStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReserveStockDto)
  items!: ReserveStockDto[];

  @IsString()
  reference!: string;
}
