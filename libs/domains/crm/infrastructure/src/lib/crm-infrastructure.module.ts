import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Sale, SaleItem, Customer, Opportunity } from '@virteex/crm-domain';
import { MikroOrmSaleRepository } from './repositories/mikro-orm-sale.repository';
import { MikroOrmCustomerRepository } from './repositories/mikro-orm-customer.repository';

@Module({
  imports: [
    MikroOrmModule.forFeature([Sale, SaleItem, Customer, Opportunity]),
  ],
  providers: [
    { provide: 'SaleRepository', useClass: MikroOrmSaleRepository },
    { provide: 'CustomerRepository', useClass: MikroOrmCustomerRepository },
  ],
  exports: ['SaleRepository', 'CustomerRepository'],
})
export class CrmInfrastructureModule {}
