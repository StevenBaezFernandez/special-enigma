import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class JournalEntryLineInputDto {
  @IsUUID()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  debit!: string;

  @IsString()
  @IsNotEmpty()
  credit!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class RecordJournalEntryDto {
  @IsDateString()
  date!: Date;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineInputDto)
  lines!: JournalEntryLineInputDto[];
}
