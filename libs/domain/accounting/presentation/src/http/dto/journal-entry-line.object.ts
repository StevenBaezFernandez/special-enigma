import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('JournalEntryLine')
export class JournalEntryLineObject {
  @Field(() => ID)
  id!: string;

  @Field()
  accountId!: string;

  @Field()
  debit!: string;

  @Field()
  credit!: string;

  @Field({ nullable: true })
  description?: string;
}
