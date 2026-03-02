import { Module } from '@nestjs/common';
import { BiController } from './controllers/bi.controller';
import { DashboardController } from './controllers/dashboard.controller';
import {
  BiApplicationModule,
  GenerateReportUseCase,
  GetTopProductsUseCase,
  GetDashboardStatsUseCase
} from '@virteex/domain-bi-application';
import { BiInfrastructureModule } from '@virteex/domain-bi-infrastructure'; // Correct import path assumption or relative
import { AccountingInfrastructureModule } from '@virteex/domain-accounting-infrastructure';
import { CrmInfrastructureModule } from '@virteex/domain-crm-infrastructure';

@Module({
  imports: [BiApplicationModule, BiInfrastructureModule, AccountingInfrastructureModule, CrmInfrastructureModule],
  controllers: [BiController, DashboardController],
  providers: [
    GenerateReportUseCase,
    GetTopProductsUseCase,
    GetDashboardStatsUseCase
  ]
})
export class BiPresentationModule {}
