import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PayrollStatus, PayrollType, PayrollDetailType } from '@virteex/contracts';
import {
  EmployeeRepository,
  EMPLOYEE_REPOSITORY,
  PayrollRepository,
  PAYROLL_REPOSITORY,
  Payroll,
  PayrollDetail,
  TaxStrategyFactory,
  TAX_STRATEGY_FACTORY,
  AttendanceRepository,
  ATTENDANCE_REPOSITORY,
  PayrollCalculationService,
  TenantConfigRepository,
  TENANT_CONFIG_REPOSITORY
} from '@virteex/payroll-domain';
import { CalculatePayrollDto } from '@virteex/contracts';

@Injectable()
export class CalculatePayrollUseCase {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private employeeRepository: EmployeeRepository,
    @Inject(PAYROLL_REPOSITORY) private payrollRepository: PayrollRepository,
    @Inject(TAX_STRATEGY_FACTORY) private taxStrategyFactory: TaxStrategyFactory,
    @Inject(TENANT_CONFIG_REPOSITORY) private tenantConfigRepo: TenantConfigRepository,
    @Inject(ATTENDANCE_REPOSITORY) private attendanceRepository: AttendanceRepository,
    private payrollCalculator: PayrollCalculationService
  ) {}

  async execute(dto: CalculatePayrollDto): Promise<Payroll> {
    const { tenantId, employeeId, periodStart, periodEnd } = dto;
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid period dates');
    }

    if (start > end) {
      throw new BadRequestException('Start date must be before end date');
    }

    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    if (employee.tenantId !== tenantId) {
       throw new NotFoundException(`Employee with ID ${employeeId} not found in tenant ${tenantId}`);
    }

    // Check if payroll already exists for this period
    const existing = await this.payrollRepository.findByEmployeeAndPeriod(employeeId, start, end);
    if (existing) {
      throw new ConflictException(`Payroll for employee ${employeeId} in period ${start.toISOString()} - ${end.toISOString()} already exists`);
    }

    // Get Tenant Config for Country Strategy
    const tenantConfig = await this.tenantConfigRepo.getFiscalConfig(tenantId);
    const taxStrategy = this.taxStrategyFactory.getStrategy(tenantConfig.country);

    // Calculate incidences
    const incidencesDays = await this.attendanceRepository.countIncidences(employeeId, start, end);

    const baseAmount = this.payrollCalculator.calculateProportionalSalary(
      employee.salary,
      start,
      end,
      incidencesDays
    );

    // Create Payroll
    const payroll = new Payroll(tenantId, employee, start, end, new Date());
    payroll.type = PayrollType.REGULAR;
    payroll.status = PayrollStatus.DRAFT;

    // Add Salary Detail
    const salaryDetail = new PayrollDetail(tenantId, 'Sueldo Base', baseAmount, PayrollDetailType.EARNING);
    payroll.details.add(salaryDetail);

    // Calculate ISR (Tax Deduction)
    const taxAmount = await taxStrategy.calculateTax(baseAmount, end);
    const taxDetail = new PayrollDetail(tenantId, 'ISR Retenido', taxAmount, PayrollDetailType.DEDUCTION);
    payroll.details.add(taxDetail);

    // Calculate IMSS
    const days = this.payrollCalculator.calculateDays(start, end);
    const dailySalary = employee.salary / 30; // Approx
    const imssAmount = this.payrollCalculator.calculateImss(dailySalary, days);
    const imssDetail = new PayrollDetail(tenantId, 'Cuota IMSS', imssAmount, PayrollDetailType.DEDUCTION);
    payroll.details.add(imssDetail);

    // Update totals
    payroll.totalEarnings = baseAmount;
    payroll.totalDeductions = taxAmount + imssAmount;
    payroll.netPay = Number((baseAmount - payroll.totalDeductions).toFixed(2));

    await this.payrollRepository.save(payroll);

    return payroll;
  }
}
