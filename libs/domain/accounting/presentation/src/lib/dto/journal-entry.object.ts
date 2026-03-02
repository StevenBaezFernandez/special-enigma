import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { JournalEntryStatus } from '@virteex/domain-accounting-contracts';

registerEnumType(JournalEntryStatus, { name: 'JournalEntryStatus' });

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
}
