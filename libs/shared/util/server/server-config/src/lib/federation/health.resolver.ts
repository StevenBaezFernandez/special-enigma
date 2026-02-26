import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HealthResolver {
  @Query(() => String, { name: '_serviceName_health', description: 'Returns UP if the service is running.' })
  checkHealth(): string {
    return 'UP';
  }
}
