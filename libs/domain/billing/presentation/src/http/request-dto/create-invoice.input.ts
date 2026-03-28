import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, ValidateNested, IsArray, Min, IsNotEmpty, IsDateString, Max } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateInvoiceItemInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  productId?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  taxRate?: number;
}

@InputType()
export class CreateInvoiceInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  tenantId?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @Field()
  @IsDateString()
  @IsNotEmpty()
  dueDate!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  paymentForm!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  usage!: string;

  @Field(() => [CreateInvoiceItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemInput)
  items!: CreateInvoiceItemInput[];
}
