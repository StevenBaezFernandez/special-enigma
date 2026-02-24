import { Module } from '@nestjs/common';
import { CalculatePayrollUseCase } from './use-cases/calculate-payroll.use-case';
import { GetEmployeesUseCase } from './use-cases/get-employees.use-case';
import { StampPayrollUseCase } from './use-cases/stamp-payroll.use-case';
import { PayrollCalculationService } from '@virteex/domain-payroll-domain';
import { XsltService } from '@virteex/shared-infrastructure-xslt';
import { ServerConfigModule } from '@virteex/shared-util-server-config';

@Module({
  imports: [ServerConfigModule],
  providers: [
    CalculatePayrollUseCase,
    GetEmployeesUseCase,
    PayrollCalculationService,
    StampPayrollUseCase,
    XsltService
  ],
  exports: [CalculatePayrollUseCase, GetEmployeesUseCase, StampPayrollUseCase]
})
export class PayrollApplicationModule {}
