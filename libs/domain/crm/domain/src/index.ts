export { Sale, SaleItem, SaleStatus } from './lib/entities/sale.entity';
export { type SaleRepository } from './lib/repositories/sale.repository';
export { Customer } from './lib/entities/customer.entity';
export { type CustomerRepository } from './lib/repositories/customer.repository';
export { Opportunity } from './lib/entities/opportunity.entity';
export * from './lib/ports/inventory.service';
export { type CatalogService, type Product } from './lib/ports/catalog.service';
