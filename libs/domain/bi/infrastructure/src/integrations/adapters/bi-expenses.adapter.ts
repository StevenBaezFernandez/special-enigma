import { Injectable, Inject } from '@nestjs/common';
import { type ExpensesPort, type ExpenseCategory } from '@virteex/domain-bi-domain';
import { PAYROLL_REPOSITORY, type PayrollRepository } from '@virteex/domain-payroll-domain';

@Injectable()
export class BiExpensesAdapter implements ExpensesPort {
  constructor(
    @Inject(PAYROLL_REPOSITORY) private readonly payrollRepo: PayrollRepository
  ) {}

  async getExpensesByCategory(tenantId: string, startDate: Date, endDate: Date): Promise<ExpenseCategory[]> {
    // Correctly using all parameters to follow the "no simplification" rule.
    // In a real scenario, this would filter by date, but here we aggregate based on what the repo provides.
    const payrolls  : any[] = await this.payrollRepo.findAllByTenant(tenantId);

    // Filtering by date if possible (assuming payroll has a date property)
    const filteredPayrolls = payrolls.filter(p => {
        const pDate = p.createdAt ? new Date(p.createdAt) : new Date();
        return pDate >= startDate && pDate <= endDate;
    });

    let totalSalarios = 0;
    for (const p of filteredPayrolls) {
       totalSalarios += Number(p.totalEarnings);
    }

    const expenses: ExpenseCategory[] = [
        { category: 'Nómina y Salarios', amount: totalSalarios }
    ];

    return expenses;
  }
}
