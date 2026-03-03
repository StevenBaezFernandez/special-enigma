import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { SaleSchema, SaleItemSchema } from './entities/sale.schema';
import { CustomerSchema } from './entities/customer.schema';
import { OpportunitySchema } from './entities/opportunity.schema';
import { MikroOrmSaleRepository } from './repositories/mikro-orm-sale.repository';
import { MikroOrmCustomerRepository } from './repositories/mikro-orm-customer.repository';
import { HttpInventoryAdapter } from './adapters/http-inventory.adapter';
import { HttpCatalogAdapter } from './adapters/http-catalog.adapter';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([SaleSchema, SaleItemSchema, CustomerSchema, OpportunitySchema]),
    HttpModule
  ],
  providers: [
    { provide: 'SaleRepository', useClass: MikroOrmSaleRepository },
    { provide: 'CustomerRepository', useClass: MikroOrmCustomerRepository },
    { provide: 'InventoryService', useClass: HttpInventoryAdapter },
    { provide: 'CatalogService', useClass: HttpCatalogAdapter },
  ],
  exports: ['SaleRepository', 'CustomerRepository', 'InventoryService', 'CatalogService'],
})
export class CrmInfrastructureModule {}
