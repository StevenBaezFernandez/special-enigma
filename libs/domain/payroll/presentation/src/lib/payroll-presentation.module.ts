import { Module } from '@nestjs/common';
import { PayrollApplicationModule, CalculatePayrollUseCase } from '../../../application/src/index';
import { PayrollInfrastructureModule } from '../../../infrastructure/src/index';
import { PayrollController } from './controllers/payroll.controller';

@Module({
  imports: [
    PayrollApplicationModule,
    PayrollInfrastructureModule
  ],
  controllers: [PayrollController],
  providers: [],
  exports: [PayrollApplicationModule, PayrollInfrastructureModule]
})
export class PayrollPresentationModule {}
