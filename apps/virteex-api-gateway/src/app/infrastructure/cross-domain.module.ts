import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Customer } from '@virteex/crm-domain';
import { Product } from '@virteex/catalog-domain';
import { CUSTOMER_REPOSITORY, PRODUCT_REPOSITORY } from '@virteex/billing-domain';
import { MikroOrmCrmCustomerRepository } from './billing/repositories/mikro-orm-crm-customer.repository';
import { MikroOrmCatalogProductRepository } from './billing/repositories/mikro-orm-catalog-product.repository';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([Customer, Product])
  ],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: MikroOrmCrmCustomerRepository
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: MikroOrmCatalogProductRepository
    }
  ],
  exports: [CUSTOMER_REPOSITORY, PRODUCT_REPOSITORY]
})
export class CrossDomainInfrastructureModule {}
