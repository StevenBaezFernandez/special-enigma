import { Injectable, Inject } from '@nestjs/common';
import { ExpensesPort, ExpenseCategory } from '@virteex/domain-bi-domain';
import { PAYROLL_REPOSITORY, PayrollRepository, Payroll } from '@virteex/domain-payroll-domain';

@Injectable()
export class BiExpensesAdapter implements ExpensesPort {
  constructor(
    @Inject(PAYROLL_REPOSITORY) private readonly payrollRepo: PayrollRepository
  ) {}

  async getExpensesBreakdown(tenantId: string): Promise<ExpenseCategory[]> {
    const payrolls: Payroll[] = await this.payrollRepo.findAllByTenant(tenantId);

    let totalSalarios = 0;

    for (const p of payrolls) {
       totalSalarios += Number(p.totalEarnings);
    }

    // Only return real data. If other modules provided data, we would aggregate here.
    const expenses: ExpenseCategory[] = [
        { category: 'Nómina y Salarios', amount: totalSalarios }
    ];

    return expenses;
  }
}
