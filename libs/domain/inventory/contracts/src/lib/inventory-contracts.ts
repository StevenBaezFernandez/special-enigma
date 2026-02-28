export interface WarehouseDto {
  id: string;
  name: string;
  location: string;
  tenantId: string;
}

export interface CreateWarehouseDto {
  name: string;
  location: string;
  tenantId: string;
}

export interface RegisterMovementDto {
  warehouseId: string;
  items: any[]; // Define properly if needed
}
