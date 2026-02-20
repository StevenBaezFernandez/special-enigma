import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class WarehouseObject {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  location!: string;

  @Field()
  code!: string; // Added code field

  @Field()
  tenantId!: string;
}
