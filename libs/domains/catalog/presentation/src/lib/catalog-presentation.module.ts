import { Module } from '@nestjs/common';
import {
  CatalogApplicationModule,
  GetProductsUseCase,
  GetProductByIdUseCase,
  CreateProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase
} from '@virteex/catalog-application';
import { CatalogInfrastructureModule } from '@virteex/catalog-infrastructure';
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
