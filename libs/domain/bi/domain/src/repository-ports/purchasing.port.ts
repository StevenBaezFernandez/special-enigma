export const PURCHASING_PORT = 'PURCHASING_PORT';

export interface PurchasingPort {
  getPendingApprovalsCount(tenantId: string): Promise<number>;
}
