import { Module } from '@nestjs/common';
// import { BiInfrastructureModule } from '@virteex/infra-bi-infrastructure';
import { BI_REPORT_REPOSITORY } from '@virteex/domain-bi-domain';
import { GenerateReportUseCase } from './use-cases/generate-report.use-case';
import { GetTopProductsUseCase } from './use-cases/get-top-products.use-case';
import { GetInvoiceStatusUseCase } from './use-cases/get-invoice-status.use-case';
import { GetArAgingUseCase } from './use-cases/get-ar-aging.use-case';
import { GetExpensesUseCase } from './use-cases/get-expenses.use-case';
import { GetDashboardStatsUseCase } from './use-cases/get-dashboard-stats.use-case'; // Added

@Module({
  imports: [
    // BiInfrastructureModule
  ],
  providers: [
    GenerateReportUseCase,
    GetTopProductsUseCase,
    GetInvoiceStatusUseCase,
    GetArAgingUseCase,
    GetExpensesUseCase,
    GetDashboardStatsUseCase // Added
  ],
  exports: [
    GenerateReportUseCase,
    GetTopProductsUseCase,
    GetInvoiceStatusUseCase,
    GetArAgingUseCase,
    GetExpensesUseCase,
    GetDashboardStatsUseCase // Added
  ]
})
export class BiApplicationModule {}
