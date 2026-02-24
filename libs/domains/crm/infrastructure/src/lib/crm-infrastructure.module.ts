import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { Sale, SaleItem, Customer, Opportunity } from '@virteex/domain-crm-domain';
import { MikroOrmSaleRepository } from './repositories/mikro-orm-sale.repository';
import { MikroOrmCustomerRepository } from './repositories/mikro-orm-customer.repository';
import { HttpInventoryAdapter } from './adapters/http-inventory.adapter';
import { HttpCatalogAdapter } from './adapters/http-catalog.adapter';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([Sale, SaleItem, Customer, Opportunity]),
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
