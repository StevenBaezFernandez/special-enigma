import { IsString, IsNumber, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @IsString()
  description!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unitPrice!: number;

  @IsString()
  @IsOptional()
  productId?: string;
}

export class CreateInvoiceDto {
  @IsString()
  @IsOptional()
  tenantId!: string;

  @IsString()
  customerId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];
}
