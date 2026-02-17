import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class Product {
  @Field(() => ID)
  id!: number;

  @Field()
  sku!: string;

  @Field()
  name!: string;

  @Field(() => Float)
  price!: string;

  @Field({ nullable: true })
  fiscalCode?: string;

  @Field({ nullable: true })
  taxGroup?: string;

  @Field()
  isActive!: boolean;
}
