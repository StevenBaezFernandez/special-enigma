import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { LocalizationController } from './controllers/localization.controller';
import { TenantController } from './controllers/tenant.controller';
import { IdentityInfrastructureModule } from '@virteex/domain-identity-infrastructure';
import { AuthModule } from '@virteex/kernel-auth';
import { IdentityResolver } from './graphql/identity.resolver';
import { RequestContextService } from './services/request-context.service';
import { CookiePolicyService } from './services/cookie-policy.service';

@Module({
  imports: [IdentityInfrastructureModule, AuthModule],
  controllers: [AuthController, UsersController, LocalizationController, TenantController],
  providers: [IdentityResolver, RequestContextService, CookiePolicyService],
  exports: [],
})
export class IdentityPresentationModule {}
