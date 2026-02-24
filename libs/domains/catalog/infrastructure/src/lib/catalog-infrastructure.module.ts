import { Module, Global, OnModuleInit } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Product, SAT_CATALOG_REPOSITORY, SatPaymentForm, SatPaymentMethod, SatCfdiUsage } from '@virteex/domain-catalog-domain';
import { MikroOrmProductRepository } from './repositories/mikro-orm-product.repository';
import { MikroOrmSatCatalogRepository } from './repositories/mikro-orm-sat-catalog.repository';
import { CatalogSeederService } from './services/catalog-seeder.service';
import { CatalogKafkaPublisher } from './listeners/catalog-kafka.publisher';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([Product, SatPaymentForm, SatPaymentMethod, SatCfdiUsage])],
  providers: [
    {
      provide: 'ProductRepository',
      useClass: MikroOrmProductRepository,
    },
    {
      provide: SAT_CATALOG_REPOSITORY,
      useClass: MikroOrmSatCatalogRepository,
    },
    CatalogSeederService,
    CatalogKafkaPublisher
  ],
  exports: ['ProductRepository', SAT_CATALOG_REPOSITORY, CatalogSeederService],
})
export class CatalogInfrastructureModule implements OnModuleInit {
  constructor(private readonly seeder: CatalogSeederService) {}

  async onModuleInit() {
    await this.seeder.seed();
  }
}
