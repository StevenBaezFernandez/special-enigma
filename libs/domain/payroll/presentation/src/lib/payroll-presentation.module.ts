import { Module } from '@nestjs/common';
import {
  PayrollApplicationModule,
  CalculatePayrollUseCase,
  GetEmployeesUseCase,
} from '@virteex/application-payroll-application';
import { PayrollInfrastructureModule } from '@virteex/infra-payroll-infrastructure';
import { PayrollController } from './controllers/payroll.controller';
import { PayrollResolver } from './resolvers/payroll.resolver';

@Module({
  imports: [PayrollApplicationModule, PayrollInfrastructureModule],
  controllers: [PayrollController],
  providers: [PayrollResolver, CalculatePayrollUseCase, GetEmployeesUseCase],
  exports: [PayrollApplicationModule, PayrollInfrastructureModule],
})
export class PayrollPresentationModule {}
