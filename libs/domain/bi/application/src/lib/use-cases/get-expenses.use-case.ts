import { Injectable, Inject } from '@nestjs/common';
import { ExpensesPort, EXPENSES_PORT, ExpenseCategory } from '@virteex/domain-bi-domain';

@Injectable()
export class GetExpensesUseCase {
  constructor(
    @Inject(EXPENSES_PORT) private readonly expensesPort: ExpensesPort
  ) {}

  async execute(tenantId: string): Promise<ExpenseCategory[]> {
    return this.expensesPort.getExpensesBreakdown(tenantId);
  }
}
