import { InputType, Field } from '@nestjs/graphql';
import { AccountType } from '@virteex/contracts-accounting-contracts';

@InputType()
export class CreateAccountInput {
  @Field()
  tenantId!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field(() => AccountType)
  type!: AccountType;

  @Field({ nullable: true })
  parentId?: string;
}
