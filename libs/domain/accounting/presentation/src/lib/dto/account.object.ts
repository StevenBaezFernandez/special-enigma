import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';
import { AccountType } from '@virteex/domain-accounting-contracts';

registerEnumType(AccountType, { name: 'AccountType' });

@ObjectType('Account')
export class AccountObject {
  @Field(() => ID)
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field(() => AccountType)
  type!: AccountType;

  @Field(() => Int)
  level!: number;

  @Field({ nullable: true })
  currency?: string;

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field(() => AccountObject, { nullable: true })
  parent?: AccountObject;

  @Field(() => [AccountObject], { nullable: true })
  children?: AccountObject[];
}
