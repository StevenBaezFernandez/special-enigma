import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class JournalEntryLineInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  accountId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  debit!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  credit!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class RecordJournalEntryInput {
  @Field()
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @Field(() => [JournalEntryLineInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineInput)
  lines!: JournalEntryLineInput[];
}
