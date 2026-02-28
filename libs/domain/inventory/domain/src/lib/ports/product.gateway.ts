export const PRODUCT_GATEWAY = 'PRODUCT_GATEWAY';

export interface ProductGateway {
  exists(productId: string): Promise<boolean>;
  getTenantId(productId: string): Promise<string | null>;
}
