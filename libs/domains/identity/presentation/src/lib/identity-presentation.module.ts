import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { TenantController } from './controllers/tenant.controller';
import { SubscriptionController } from './controllers/subscription.controller'; // Added
import { IdentityInfrastructureModule } from '@virteex/identity-infrastructure';

@Module({
  imports: [IdentityInfrastructureModule],
  controllers: [AuthController, UsersController, TenantController, SubscriptionController], // Added
  providers: [],
  exports: [],
})
export class IdentityPresentationModule {}
