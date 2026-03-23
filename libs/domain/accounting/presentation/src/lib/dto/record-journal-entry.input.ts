import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsDate, IsArray, ValidateNested, IsOptional, IsUUID } from 'class-validator';
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
  @IsDate()
  @IsNotEmpty()
  date!: Date;

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
