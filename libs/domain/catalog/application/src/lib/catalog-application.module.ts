import { Module } from '@nestjs/common';
import { GetProductsUseCase } from './use-cases/products/get-products.use-case';
import { GetProductByIdUseCase } from './use-cases/products/get-product-by-id.use-case';
import { CreateProductUseCase } from './use-cases/products/create-product.use-case';
import { UpdateProductUseCase } from './use-cases/products/update-product.use-case';
import { DeleteProductUseCase } from './use-cases/products/delete-product.use-case';
import { GetSatCatalogsUseCase } from './use-cases/sat-catalogs/get-sat-catalogs.use-case';
import { GetProductBySkuUseCase } from './use-cases/products/get-product-by-sku.use-case';

@Module({
  providers: [
    GetProductsUseCase,
    GetProductByIdUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetSatCatalogsUseCase,
    GetProductBySkuUseCase
  ],
  exports: [
    GetProductsUseCase,
    GetProductByIdUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetSatCatalogsUseCase,
    GetProductBySkuUseCase
  ],
})
export class CatalogApplicationModule {}
