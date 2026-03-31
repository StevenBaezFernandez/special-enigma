export interface AccountsReceivableRepository {
  // Placeholder for future AR implementation
  findAll(tenantId: string): Promise<any[]>;
}

export const ACCOUNTS_RECEIVABLE_REPOSITORY = 'ACCOUNTS_RECEIVABLE_REPOSITORY';
