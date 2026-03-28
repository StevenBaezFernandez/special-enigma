import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { SaleSchema, SaleItemSchema } from '../persistence/entities/sale.schema';
import { CustomerSchema } from '../persistence/entities/customer.schema';
import { OpportunitySchema } from '../persistence/entities/opportunity.schema';
import { MikroOrmSaleRepository } from '../persistence/repositories/mikro-orm-sale.repository';
import { MikroOrmCustomerRepository } from '../persistence/repositories/mikro-orm-customer.repository';
import { HttpInventoryAdapter } from '../integrations/http/http-inventory.adapter';
import { HttpCatalogAdapter } from '../integrations/http/http-catalog.adapter';

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
