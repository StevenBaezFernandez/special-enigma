import { Module } from '@nestjs/common';
import { TreasuryApplicationModule } from '@virteex/application-treasury-application';
import { TreasuryInfrastructureModule } from '@virteex/infra-billing-infrastructure';
import { TreasuryController } from './controllers/treasury.controller';
import { TreasuryResolver } from './resolvers/treasury.resolver';

@Module({
  imports: [TreasuryApplicationModule, TreasuryInfrastructureModule],
  controllers: [TreasuryController],
  providers: [TreasuryResolver],
})
export class TreasuryPresentationModule {}
