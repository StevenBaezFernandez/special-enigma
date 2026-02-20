import { InputType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { InventoryMovementType } from '@virteex/inventory-application';

// Register Enum for GraphQL
registerEnumType(InventoryMovementType, {
  name: 'InventoryMovementType',
});

@InputType()
export class RegisterMovementItemInput {
  @Field()
  productId!: string;

  @Field()
  quantity!: string;

  @Field(() => InventoryMovementType)
  type!: InventoryMovementType;

  @Field()
  reference!: string;

  @Field({ nullable: true })
  locationId?: string;
}
