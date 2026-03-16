export * from './lib/entities/invoice.entity';
export * from './lib/entities/invoice-item.entity';
export * from './lib/entities/tax-line.entity';
export * from './lib/entities/tax-rule.entity';
export * from './lib/entities/payment-method.entity';

export * from './lib/services/tax-calculator.service';
export * from './lib/services/tax-rule.engine';
export * from './lib/services/fiscal-stamping.service';
export * from './lib/strategies/tax-strategy.interface';
export * from './lib/strategies/tax-strategy.factory';

export * from './lib/ports/pac-provider.port';
export { type PaymentProvider, PAYMENT_PROVIDER } from './lib/ports/payment-provider.port';
export { type InvoiceRepository, INVOICE_REPOSITORY } from './lib/ports/invoice.repository';
export { type PaymentMethodRepository, PAYMENT_METHOD_REPOSITORY } from './lib/ports/payment-method.repository';
export { type TenantConfigRepository, type TenantFiscalConfig, TENANT_CONFIG_REPOSITORY } from './lib/ports/tenant-config.port';
export * from './lib/ports/customer.repository';
export { type ProductRepository, type BillingProduct, PRODUCT_REPOSITORY } from './lib/repositories/product.repository';

export * from './lib/events/invoice-stamped.event';

export * from './lib/billing-domain.module';
export * from './lib/ports/pac-strategy.factory';
