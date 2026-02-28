import { Module } from '@nestjs/common';
import { FiscalController } from './controllers/fiscal.controller';
import {
  FiscalApplicationModule,
  CreateDeclarationUseCase,
  GetFiscalStatsUseCase,
  GetTaxRulesUseCase,
  CreateTaxRuleUseCase,
  GetTaxRateUseCase
} from '@virteex/application-fiscal-application';
import { FiscalInfrastructureModule } from '../../../infrastructure/src/index';

@Module({
  imports: [FiscalApplicationModule, FiscalInfrastructureModule],
  controllers: [FiscalController],
  providers: [
    CreateDeclarationUseCase,
    GetFiscalStatsUseCase,
    GetTaxRulesUseCase,
    CreateTaxRuleUseCase,
    GetTaxRateUseCase
  ]
})
export class FiscalPresentationModule {}
