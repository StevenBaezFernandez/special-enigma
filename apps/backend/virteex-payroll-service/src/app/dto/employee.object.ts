import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class EmployeeObject {
  @Field(() => ID)
  id!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  position?: string;

  @Field(() => Float)
  salary!: number;

  @Field()
  status!: string;
}
