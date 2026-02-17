import { Module } from '@nestjs/common';
import { GetProductsUseCase } from './use-cases/get-products.use-case';
import { GetProductByIdUseCase } from './use-cases/get-product-by-id.use-case';
import { CreateProductUseCase } from './use-cases/create-product.use-case';
import { UpdateProductUseCase } from './use-cases/update-product.use-case';
import { DeleteProductUseCase } from './use-cases/delete-product.use-case';
import { GetSatCatalogsUseCase } from './use-cases/get-sat-catalogs.use-case';

@Module({
  providers: [
    GetProductsUseCase,
    GetProductByIdUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetSatCatalogsUseCase
  ],
  exports: [
    GetProductsUseCase,
    GetProductByIdUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetSatCatalogsUseCase
  ],
})
export class CatalogApplicationModule {}
