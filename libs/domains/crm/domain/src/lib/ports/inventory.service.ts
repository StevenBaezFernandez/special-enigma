export interface Warehouse {
    id: string;
    name: string;
    tenantId: string;
}

export interface StockReservationItem {
    warehouseId: string;
    productSku: string;
    quantity: number;
}

export interface InventoryService {
    checkStock(warehouseId: string, productSku: string, quantity: number): Promise<boolean>;
    reserveStock(warehouseId: string, productSku: string, quantity: number, reference: string): Promise<void>;
    reserveBatchStock(items: StockReservationItem[], reference: string): Promise<void>;
    getWarehouse(id: string): Promise<Warehouse | null>;
    getWarehouses(tenantId: string): Promise<Warehouse[]>;
}
