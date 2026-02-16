import { Module } from '@nestjs/common';
import { GenerateReportUseCase } from './use-cases/generate-report.use-case';
import { GetTopProductsUseCase } from './use-cases/get-top-products.use-case';
import { GetInvoiceStatusUseCase } from './use-cases/get-invoice-status.use-case';
import { GetArAgingUseCase } from './use-cases/get-ar-aging.use-case';
import { GetExpensesUseCase } from './use-cases/get-expenses.use-case';

@Module({
  imports: [],
  providers: [
    GenerateReportUseCase,
    GetTopProductsUseCase,
    GetInvoiceStatusUseCase,
    GetArAgingUseCase,
    GetExpensesUseCase
  ],
  exports: [
    GenerateReportUseCase,
    GetTopProductsUseCase,
    GetInvoiceStatusUseCase,
    GetArAgingUseCase,
    GetExpensesUseCase
  ]
})
export class BiApplicationModule {}
