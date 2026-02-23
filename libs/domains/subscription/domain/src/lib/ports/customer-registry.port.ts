export const CUSTOMER_REGISTRY_GATEWAY = 'CUSTOMER_REGISTRY_GATEWAY';

export interface CustomerRegistryGateway {
  createCustomer(email: string, name: string, paymentMethodId: string): Promise<string>;
}
