import { InputType, Field } from '@nestjs/graphql';
import { AccountType, CreateAccountDto } from '@virteex/domain-accounting-contracts';

@InputType()
export class CreateAccountInput extends CreateAccountDto {
  @Field()
  override code!: string;

  @Field()
  override name!: string;

  @Field(() => AccountType)
  override type!: AccountType;

  @Field({ nullable: true })
  override parentId?: string;
}
