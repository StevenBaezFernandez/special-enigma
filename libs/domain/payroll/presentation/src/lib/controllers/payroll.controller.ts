import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalculatePayrollDto } from '@virteex/domain-payroll-contracts';
import { CalculatePayrollUseCase, GetEmployeesUseCase } from '@virteex/domain-payroll-application';
import { type Payroll, Employee } from '@virteex/domain-payroll-domain';
import { JwtAuthGuard, TenantGuard, CurrentTenant } from '@virteex/kernel-auth';

@ApiTags('Payroll')
@Controller('payroll')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PayrollController {
  constructor(
    private readonly calculatePayrollUseCase: CalculatePayrollUseCase,
    private readonly getEmployeesUseCase: GetEmployeesUseCase
  ) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate payroll for an employee' })
  @ApiResponse({ status: 201 })
  async calculatePayroll(@Body() dto: CalculatePayrollDto, @CurrentTenant() tenantId: string): Promise<Payroll> {
    return this.calculatePayrollUseCase.execute({ ...dto, tenantId });
  }

  @Get('employees')
  @ApiOperation({ summary: 'Get all employees' })
  async getEmployees(@CurrentTenant() tenantId: string): Promise<Employee[]> {
    return this.getEmployeesUseCase.execute(tenantId);
  }
}
