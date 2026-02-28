import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currency!: string;
}
