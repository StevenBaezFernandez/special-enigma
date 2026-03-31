export const CATALOG_PORT = 'CATALOG_PORT';

export interface CatalogPort {
  getInventoryAlertsCount(tenantId: string): Promise<number>;
}
