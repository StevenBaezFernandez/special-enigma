export * from './entities/sale.entity';
export type { SaleRepository } from './repository-ports/sale.repository';
export * from './entities/customer.entity';
export type { CustomerRepository } from './repository-ports/customer.repository';
export * from './entities/opportunity.entity';
export * from './domain-services/inventory.service';
export type { CatalogService, Product } from './domain-services/catalog.service';
