import { IsString, IsNumber, IsOptional, ValidateNested, IsArray, Min, IsNotEmpty, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsNumber()
  @Min(0)
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
  @IsNotEmpty()
  customerId!: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate!: string;

  @IsString()
  @IsNotEmpty()
  paymentForm!: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @IsString()
  @IsNotEmpty()
  usage!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];
}
