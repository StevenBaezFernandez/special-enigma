export const TREASURY_PORT = 'TREASURY_PORT';

export interface TreasuryPort {
  getCashFlow(tenantId: string): Promise<number>;
}
