import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CalculatePayrollInput {
  @Field(() => ID)
  employeeId!: string;

  @Field()
  periodStart!: string;

  @Field()
  periodEnd!: string;
}
