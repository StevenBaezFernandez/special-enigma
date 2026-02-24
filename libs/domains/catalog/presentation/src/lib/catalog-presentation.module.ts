import { Module } from '@nestjs/common';
import {
  CatalogApplicationModule,
  GetProductsUseCase,
  GetProductByIdUseCase,
  CreateProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase
} from '@virteex/application-catalog-application';
import { CatalogInfrastructureModule } from '@virteex/infra-catalog-infrastructure';
import { CatalogController } from './controllers/catalog.controller';

@Module({
  imports: [CatalogApplicationModule, CatalogInfrastructureModule],
  controllers: [CatalogController],
  providers: [
    GetProductsUseCase,
    GetProductByIdUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase
  ]
})
export class CatalogPresentationModule {}
