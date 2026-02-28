import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class JournalEntryLineInput {
  @Field()
  accountId!: string;

  @Field()
  debit!: string;

  @Field()
  credit!: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class RecordJournalEntryInput {
  @Field()
  tenantId!: string;

  @Field()
  date!: Date;

  @Field()
  description!: string;

  @Field(() => [JournalEntryLineInput])
  lines!: JournalEntryLineInput[];
}
