import { Module } from '@nestjs/common';
import { CalculatePayrollUseCase } from './use-cases/calculate-payroll.use-case';
import { GetEmployeesUseCase } from './use-cases/get-employees.use-case';
import { StampPayrollUseCase } from './use-cases/stamp-payroll.use-case';
import { PayrollInfrastructureModule } from '../../../infrastructure/src/index';
import { PayrollCalculationService } from '../../../domain/src/index';
import { XsltService } from '@virteex/shared-infrastructure-xslt';

@Module({
  imports: [PayrollInfrastructureModule],
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
