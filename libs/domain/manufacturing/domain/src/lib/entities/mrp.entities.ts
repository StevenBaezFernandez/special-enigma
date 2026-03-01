export enum ManufacturingOrderStatus {
  PLANNED = 'PLANNED',
  RELEASED = 'RELEASED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface ManufacturingOrder {
  id: string;
  productId: string;
  quantity: number;
  startDate: Date;
  endDate?: Date;
  status: ManufacturingOrderStatus;
  workCenterId: string;
}

export interface WorkCenter {
  id: string;
  name: string;
  capacityPerHour: number;
}
