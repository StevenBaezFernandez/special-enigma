import { v4 } from 'uuid';
import type { Warehouse } from './warehouse.entity';

export class Location {
  id: string;
  tenantId: string;
  warehouseId: string;
  code: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(tenantId: string, warehouseId: string, code: string, type: string, id?: string) {
    this.id = id || v4();
    this.tenantId = tenantId;
    this.warehouseId = warehouseId;
    this.code = code;
    this.type = type;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
