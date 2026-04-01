import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  tenantId?: string;

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
