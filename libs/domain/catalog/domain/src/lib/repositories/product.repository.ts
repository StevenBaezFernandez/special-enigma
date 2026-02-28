import { ProductReadRepository } from './product-read.repository';
import { ProductWriteRepository } from './product-write.repository';

/**
 * Legacy composite contract kept for backward compatibility.
 * Prefer ProductReadRepository/ProductWriteRepository in new code.
 */
export type ProductRepository = ProductReadRepository & ProductWriteRepository;
