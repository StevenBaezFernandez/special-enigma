import { type Product } from '../entities/product.entity';

export const PRODUCT_WRITE_REPOSITORY = 'PRODUCT_WRITE_REPOSITORY';

export interface ProductWriteRepository {
  create(product: Product): Promise<Product>;
  save(product: Product): Promise<void>;
  delete(id: number): Promise<void>;
}
