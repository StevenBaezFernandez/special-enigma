import { ApiProperty } from '@nestjs/swagger';

export class BankAccountDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  accountNumber!: string;

  @ApiProperty()
  bankName!: string;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  balance!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
