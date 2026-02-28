import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { TenantController } from './controllers/tenant.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { IdentityInfrastructureModule } from '@virteex/infra-identity-infrastructure';
import { AuthModule } from '@virteex/kernel-auth';
import { IdentityResolver } from './graphql/identity.resolver';

@Module({
  imports: [IdentityInfrastructureModule, AuthModule],
  controllers: [AuthController, UsersController, TenantController, SubscriptionController],
  providers: [IdentityResolver],
  exports: [],
})
export class IdentityPresentationModule {}
