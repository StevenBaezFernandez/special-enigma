export interface ExpenseCategory {
  category: string;
  amount: number;
}

export interface ExpensesPort {
  getExpensesBreakdown(tenantId: string): Promise<ExpenseCategory[]>;
}

export const EXPENSES_PORT = 'BI_EXPENSES_PORT';
