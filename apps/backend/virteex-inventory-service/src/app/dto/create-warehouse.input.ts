import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateWarehouseInput {
  @Field()
  name!: string;

  @Field()
  location!: string;
}
