import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../enums/transaction-type.enum';

export class RegisterTransactionDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  bankAccountId!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ enum: TransactionType })
  type!: TransactionType;

  @ApiProperty()
  description!: string;
}
