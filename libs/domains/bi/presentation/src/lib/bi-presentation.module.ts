import { Module } from '@nestjs/common';
import { BiController } from './controllers/bi.controller';
import { DashboardController } from './controllers/dashboard.controller';
import {
  BiApplicationModule,
  GenerateReportUseCase,
  GetTopProductsUseCase,
  GetDashboardStatsUseCase
} from '@virteex/application-bi-application';
import { BiInfrastructureModule } from '@virteex/infra-bi-infrastructure'; // Correct import path assumption or relative
import { AccountingInfrastructureModule } from '@virteex/infra-accounting-infrastructure';
import { CrmInfrastructureModule } from '@virteex/infra-crm-infrastructure';

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
