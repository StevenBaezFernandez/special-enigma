import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class SatPaymentForm {
  @Field(() => ID)
  code!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class SatPaymentMethod {
  @Field(() => ID)
  code!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class SatCfdiUsage {
  @Field(() => ID)
  code!: string;

  @Field()
  name!: string;
}
