import { Module } from '@nestjs/common';
import {
  PayrollApplicationModule,
  CalculatePayrollUseCase,
  GetEmployeesUseCase,
} from '@virteex/domain-payroll-application';
import { PayrollInfrastructureModule } from '@virteex/domain-payroll-infrastructure';
import { PayrollController } from './controllers/payroll.controller';
import { PayrollResolver } from './resolvers/payroll.resolver';

@Module({
  imports: [PayrollApplicationModule, PayrollInfrastructureModule],
  controllers: [PayrollController],
  providers: [PayrollResolver, CalculatePayrollUseCase, GetEmployeesUseCase],
  exports: [PayrollApplicationModule, PayrollInfrastructureModule],
})
export class PayrollPresentationModule {}
