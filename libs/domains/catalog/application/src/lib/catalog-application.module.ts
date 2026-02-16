import { Module } from '@nestjs/common';
import { GetProductsUseCase } from './use-cases/get-products.use-case';
import { CreateProductUseCase } from './use-cases/create-product.use-case';
import { UpdateProductUseCase } from './use-cases/update-product.use-case';
import { DeleteProductUseCase } from './use-cases/delete-product.use-case';
import { GetSatCatalogsUseCase } from './use-cases/get-sat-catalogs.use-case';
import { CatalogInfrastructureModule } from '../../../infrastructure/src/index';

@Module({
  imports: [CatalogInfrastructureModule],
  providers: [
    GetProductsUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetSatCatalogsUseCase
  ],
  exports: [
    GetProductsUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetSatCatalogsUseCase
  ],
})
export class CatalogApplicationModule {}
