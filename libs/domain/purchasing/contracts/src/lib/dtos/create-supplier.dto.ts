import { IsString, IsNotEmpty, IsEnum, IsEmail, IsOptional } from 'class-validator';
import { SupplierType } from '../enums/supplier-type.enum';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  taxId!: string;

  @IsEnum(SupplierType)
  type!: SupplierType;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
