export interface SatCatalogItem {
  code: string;
  name: string;
}

export interface SatCatalogRepository {
  getPaymentForms(): Promise<SatCatalogItem[]>;
  getPaymentMethods(): Promise<SatCatalogItem[]>;
  getCfdiUsages(): Promise<SatCatalogItem[]>;
}

export const SAT_CATALOG_REPOSITORY = 'SatCatalogRepository';
