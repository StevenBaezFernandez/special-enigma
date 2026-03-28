export * from './entities/invoice.entity';
export * from './entities/invoice-item.entity';
export * from './entities/tax-line.entity';
export * from './entities/tax-rule.entity';
export * from './entities/payment-method.entity';

export * from './domain-services/tax-calculator.service';
export * from './domain-services/tax-rule.engine';
export * from './domain-services/fiscal-stamping.service';
export * from './repository-ports/tax-strategy.interface';
export * from './factories/tax-strategy.factory';

export * from './repository-ports/pac-provider.port';
export { type PaymentProvider, PAYMENT_PROVIDER } from './repository-ports/payment-provider.port';
export { type InvoiceRepository, INVOICE_REPOSITORY } from './repository-ports/invoice.repository';
export { type PaymentMethodRepository, PAYMENT_METHOD_REPOSITORY } from './repository-ports/payment-method.repository';
export { type TenantConfigRepository, type TenantFiscalConfig, TENANT_CONFIG_REPOSITORY } from './repository-ports/tenant-config.port';
export * from './repository-ports/customer.repository';
export { type ProductRepository, type BillingProduct, PRODUCT_REPOSITORY } from './repository-ports/product.repository';

export * from './events/invoice-stamped.event';
export * from './factories/pac-strategy.factory';
export * from './billing-domain.module';
