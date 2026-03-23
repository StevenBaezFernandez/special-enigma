import { InputType, Field } from '@nestjs/graphql';
import { AccountType } from '@virteex/domain-accounting-contracts';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class CreateAccountInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  code!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field(() => AccountType)
  @IsEnum(AccountType)
  type!: AccountType;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
