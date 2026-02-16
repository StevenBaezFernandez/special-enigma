import { Module } from '@nestjs/common';
import { GetTaxRateUseCase } from './use-cases/get-tax-rate.use-case';

@Module({
  imports: [],
  providers: [
    GetTaxRateUseCase
  ],
  exports: [
    GetTaxRateUseCase
  ]
})
export class FiscalApplicationModule {}
