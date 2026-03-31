export const CRM_PORT = 'CRM_PORT';

export interface CrmPort {
  getOpenDealsCount(tenantId: string): Promise<number>;
  getSalesToday(tenantId: string): Promise<number>;
  getMonthlySales(tenantId: string): Promise<number>;
}
