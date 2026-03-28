import { Module, Global, OnModuleInit } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SAT_CATALOG_REPOSITORY, PRODUCT_READ_REPOSITORY, PRODUCT_WRITE_REPOSITORY } from '@virteex/domain-catalog-domain';
import { MikroOrmProductRepository } from './persistence/repositories/mikro-orm-product.repository';
import { MikroOrmSatCatalogRepository } from './persistence/repositories/mikro-orm-sat-catalog.repository';
import { CatalogSeederService } from './persistence/catalog-seeder.service';
import { CatalogKafkaPublisher } from './messaging/producers/catalog-kafka.publisher';
import { ProductSchema, SatPaymentFormSchema, SatPaymentMethodSchema, SatCfdiUsageSchema, PluginSchema, PluginVersionSchema } from './persistence/orm/mikro-orm.schemas';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductSchema,
      SatPaymentFormSchema,
      SatPaymentMethodSchema,
      SatCfdiUsageSchema,
      PluginSchema,
      PluginVersionSchema,
    ]),
  ],
  providers: [
    {
      provide: PRODUCT_READ_REPOSITORY,
      useClass: MikroOrmProductRepository,
    },
    {
      provide: PRODUCT_WRITE_REPOSITORY,
      useClass: MikroOrmProductRepository,
    },
    {
      provide: 'ProductRepository',
      useClass: MikroOrmProductRepository,
    },
    {
      provide: SAT_CATALOG_REPOSITORY,
      useClass: MikroOrmSatCatalogRepository,
    },
    CatalogSeederService,
    CatalogKafkaPublisher,
  ],
  exports: [
    PRODUCT_READ_REPOSITORY,
    PRODUCT_WRITE_REPOSITORY,
    'ProductRepository',
    SAT_CATALOG_REPOSITORY,
    CatalogSeederService,
  ],
})
export class CatalogInfrastructureModule implements OnModuleInit {
  constructor(private readonly seeder: CatalogSeederService) {}

  async onModuleInit() {
    await this.seeder.seed();
  }
}
