export interface AccountsPayableRepository {
  // Placeholder for future AP implementation
  findAll(tenantId: string): Promise<any[]>;
}

export const ACCOUNTS_PAYABLE_REPOSITORY = 'ACCOUNTS_PAYABLE_REPOSITORY';
