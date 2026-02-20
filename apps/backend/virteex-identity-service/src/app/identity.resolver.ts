import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class IdentityResolver {
  @Query(() => String)
  identityHealthCheck(): string {
    return 'Identity Service is running';
  }
}
