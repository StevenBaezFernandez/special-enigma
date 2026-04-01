import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { TransactionType } from '../enums/transaction-type.enum';

export class RegisterTransactionDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ApiProperty()
  bankAccountId!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ enum: TransactionType })
  type!: TransactionType;

  @ApiProperty()
  description!: string;
}
