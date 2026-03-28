import { Module } from '@nestjs/common';
import { CatalogApplicationModule, GetProductsUseCase, GetProductByIdUseCase, CreateProductUseCase, UpdateProductUseCase, DeleteProductUseCase } from '@virteex/domain-catalog-application';
import { CatalogInfrastructureModule } from '@virteex/domain-catalog-infrastructure';
import { CatalogController } from './http/controllers/catalog.controller';
import { CatalogResolver } from './graphql/resolvers/catalog.resolver';

@Module({
  imports: [CatalogApplicationModule, CatalogInfrastructureModule],
  controllers: [CatalogController],
  providers: [
    GetProductsUseCase,
    GetProductByIdUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    CatalogResolver,
  ],
  exports: [CatalogPresentationModule],
})
export class CatalogPresentationModule {}
