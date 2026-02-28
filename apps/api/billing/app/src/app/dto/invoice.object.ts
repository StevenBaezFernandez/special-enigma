import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class InvoiceItemObject {
  @Field(() => ID)
  id!: string;

  @Field()
  description!: string;

  @Field(() => Float)
  quantity!: number;

  @Field(() => Float)
  unitPrice!: number;

  @Field(() => Float)
  subtotal!: number;

  @Field(() => Float)
  total!: number;
}

@ObjectType()
export class InvoiceObject {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  customerId!: string;

  @Field()
  issueDate!: Date;

  @Field()
  dueDate!: Date;

  @Field(() => Float)
  totalAmount!: number;

  @Field(() => Float)
  taxAmount!: number;

  @Field()
  status!: string;

  @Field({ nullable: true })
  fiscalUuid?: string;

  // @Field(() => [InvoiceItemObject], { nullable: 'items' })
  // items!: InvoiceItemObject[];
}
