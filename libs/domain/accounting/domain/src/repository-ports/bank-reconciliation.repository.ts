export interface BankReconciliationRepository {
    // Placeholder for future Bank Reconciliation implementation
    findAll(tenantId: string): Promise<any[]>;
}

export const BANK_RECONCILIATION_REPOSITORY = 'BANK_RECONCILIATION_REPOSITORY';
