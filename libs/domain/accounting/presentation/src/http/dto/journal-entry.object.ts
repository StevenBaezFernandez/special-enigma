import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { JournalEntryStatus, JournalEntryType } from '@virteex/domain-accounting-contracts';
import { JournalEntryLineObject } from './journal-entry-line.object';

registerEnumType(JournalEntryStatus, { name: 'JournalEntryStatus' });
registerEnumType(JournalEntryType, { name: 'JournalEntryType' });

@ObjectType('JournalEntry')
export class JournalEntryObject {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  date!: Date;

  @Field()
  description!: string;

  @Field(() => JournalEntryStatus)
  status!: JournalEntryStatus;

  @Field(() => JournalEntryType)
  type!: JournalEntryType;

  @Field(() => [JournalEntryLineObject])
  lines!: JournalEntryLineObject[];

  @Field({ nullable: true })
  reference?: string;

  @Field(() => Float)
  amount!: number;
}
