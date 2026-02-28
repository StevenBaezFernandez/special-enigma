export interface Product {
    id: number;
    name: string;
    sku: string;
    price: string;
}

export interface CatalogService {
    getProductById(id: number): Promise<Product | null>;
}
