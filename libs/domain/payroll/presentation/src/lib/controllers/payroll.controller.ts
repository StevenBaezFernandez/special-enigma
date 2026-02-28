import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalculatePayrollDto } from '../../../../contracts/src/index';
import { CalculatePayrollUseCase, GetEmployeesUseCase } from '../../../../application/src/index';
import { Payroll, Employee } from '../../../../domain/src/index';

@ApiTags('Payroll')
@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly calculatePayrollUseCase: CalculatePayrollUseCase,
    private readonly getEmployeesUseCase: GetEmployeesUseCase
  ) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate payroll for an employee' })
  @ApiResponse({ status: 201 })
  async calculatePayroll(@Body() dto: CalculatePayrollDto): Promise<Payroll> {
    return this.calculatePayrollUseCase.execute(dto);
  }

  @Get('employees')
  @ApiOperation({ summary: 'Get all employees' })
  async getEmployees(@Query('tenantId') tenantId: string = 'default'): Promise<Employee[]> {
    return this.getEmployeesUseCase.execute(tenantId);
  }
}
