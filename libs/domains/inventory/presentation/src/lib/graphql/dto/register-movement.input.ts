import { InputType, Field, ID } from '@nestjs/graphql';
import { RegisterMovementItemInput } from './register-movement-item.input';

@InputType()
export class RegisterMovementInput {
  @Field(() => ID)
  warehouseId!: string;

  @Field(() => [RegisterMovementItemInput])
  items!: RegisterMovementItemInput[];
}
