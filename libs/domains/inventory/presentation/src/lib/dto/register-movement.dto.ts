import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsNumberString } from 'class-validator';
import { InventoryMovementType } from '@virteex/domain-inventory-domain';

export class RegisterMovementDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsUUID()
  @IsNotEmpty()
  warehouseId!: string;

  @IsUUID()
  @IsOptional()
  locationId?: string;

  @IsEnum(InventoryMovementType)
  @IsNotEmpty()
  type!: InventoryMovementType;

  @IsNumberString()
  @IsNotEmpty()
  quantity!: string;

  @IsString()
  @IsNotEmpty()
  reference!: string;
}
