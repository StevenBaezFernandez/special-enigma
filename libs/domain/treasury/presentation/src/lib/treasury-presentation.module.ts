import { Module } from '@nestjs/common';
import { TreasuryApplicationModule } from '../../../application/src/index';
import { TreasuryInfrastructureModule } from '../../../infrastructure/src/index';
import { TreasuryController } from './controllers/treasury.controller';
import { TreasuryResolver } from './resolvers/treasury.resolver';

@Module({
  imports: [TreasuryApplicationModule, TreasuryInfrastructureModule],
  controllers: [TreasuryController],
  providers: [TreasuryResolver],
})
export class TreasuryPresentationModule {}
