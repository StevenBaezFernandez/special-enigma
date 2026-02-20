import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class BillingResolver {
  @Query(() => String)
  billingHealthCheck(): string {
    return 'Billing Service is running';
  }
}
