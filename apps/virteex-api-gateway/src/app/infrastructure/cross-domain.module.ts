import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Customer } from '@virteex/crm-domain';
import { CUSTOMER_REPOSITORY, PRODUCT_REPOSITORY } from '@virteex/billing-domain';
import { MikroOrmCrmCustomerRepository } from './billing/repositories/mikro-orm-crm-customer.repository';
import { LocalProductRepository } from './billing/repositories/local-product.repository';
import { BillingProductEntity } from './billing/entities/billing-product.entity';
import { ProductEventsController } from './billing/listeners/product-events.controller';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([Customer, BillingProductEntity])
  ],
  controllers: [ProductEventsController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: MikroOrmCrmCustomerRepository
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: LocalProductRepository
    }
  ],
  exports: [CUSTOMER_REPOSITORY, PRODUCT_REPOSITORY]
})
export class CrossDomainInfrastructureModule {}
