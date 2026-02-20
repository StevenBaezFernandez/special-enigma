import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@virteex/auth';
import { CurrentTenant } from '@virteex/shared-util-server-config';
import { CalculatePayrollUseCase, GetEmployeesUseCase } from '@virteex/payroll-application';
import { EmployeeObject } from './dto/employee.object';
import { CalculatePayrollInput } from './dto/calculate-payroll.input';

@Resolver(() => EmployeeObject)
export class PayrollResolver {
  constructor(
    private readonly getEmployeesUseCase: GetEmployeesUseCase,
    private readonly calculatePayrollUseCase: CalculatePayrollUseCase
  ) {}

  @Query(() => [EmployeeObject], { name: 'employees' })
  @UseGuards(JwtAuthGuard)
  async getEmployees(@CurrentTenant() tenantId: string) {
    return this.getEmployeesUseCase.execute(tenantId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async calculatePayroll(
    @Args('input') input: CalculatePayrollInput,
    @CurrentTenant() tenantId: string
  ) {
    await this.calculatePayrollUseCase.execute({ ...input, tenantId });
    return true;
  }
}
