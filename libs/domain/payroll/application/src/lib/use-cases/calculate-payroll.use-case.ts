import { Injectable, Inject, Logger } from '@nestjs/common';
import { PayrollStatus, PayrollType, PayrollDetailType } from '@virteex/domain-payroll-contracts';
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
} from '@virteex/domain-payroll-domain';
import { GlobalConfigService } from '@virteex/shared-util-server-server-config';
import { CalculatePayrollDto } from '@virteex/domain-payroll-contracts-payroll-contracts';
import {
  BadRequestException,
  EntityNotFoundException,
  ConflictException
} from '@virteex/kernel-exceptions';

@Injectable()
export class CalculatePayrollUseCase {
  private readonly logger = new Logger(CalculatePayrollUseCase.name);

  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private employeeRepository: EmployeeRepository,
    @Inject(PAYROLL_REPOSITORY) private payrollRepository: PayrollRepository,
    @Inject(TAX_STRATEGY_FACTORY) private taxStrategyFactory: TaxStrategyFactory,
    @Inject(TENANT_CONFIG_REPOSITORY) private tenantConfigRepo: TenantConfigRepository,
    @Inject(ATTENDANCE_REPOSITORY) private attendanceRepository: AttendanceRepository,
    private payrollCalculator: PayrollCalculationService,
    private configService: GlobalConfigService
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
      throw new EntityNotFoundException('Employee', employeeId);
    }

    if (employee.tenantId !== tenantId) {
       throw new EntityNotFoundException('Employee', employeeId);
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
    payroll.details.push(salaryDetail);

    // Prepare Options (e.g. State Tax Rate)
    const stateTaxRate = this.configService.defaultStateTaxRate;
    if (stateTaxRate === 0) {
      this.logger.warn(`State Tax Rate not configured for employee ${employeeId}. Defaulting to 0% to avoid incorrect taxation.`);
    }

    const taxOptions: Record<string, any> = {
        stateTaxRate,
        uma: this.configService.uma
    };

    // Calculate Taxes (Unified)
    // Using 'MONTHLY' as default frequency. Should be derived from contract.
    const taxResult = await this.payrollCalculator.calculatePayrollTaxes(this.taxStrategyFactory, baseAmount, tenantConfig.country, end, 'MONTHLY', taxOptions);

    const detailMap: Record<string, string> = {
        'ISR': 'ISR Retenido',
        'IMSS': 'Cuota IMSS',
        'Federal Income Tax': 'Federal Income Tax',
        'Social Security': 'Social Security',
        'Medicare': 'Medicare',
        'State Tax (Est.)': 'State Tax'
    };

    let totalDeductions = 0;

    for (const detail of taxResult.details) {
        const conceptName = detailMap[detail.name] || detail.name;
        const payrollDetail = new PayrollDetail(
            tenantId,
            conceptName,
            detail.amount,
            PayrollDetailType.DEDUCTION
        );
        payroll.details.push(payrollDetail);
        totalDeductions += detail.amount;
    }

    // Update totals
    payroll.totalEarnings = baseAmount;
    payroll.totalDeductions = totalDeductions;
    payroll.netPay = Number((baseAmount - payroll.totalDeductions).toFixed(2));

    await this.payrollRepository.save(payroll);

    return payroll;
  }
}
