import { v4 } from 'uuid';
import type { Location } from './location.entity';

export class Warehouse {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  address?: string;
  description?: string;
  isActive = true;
  createdAt: Date;
  updatedAt: Date;

  constructor(tenantId: string, code: string, name: string, id?: string) {
    this.id = id || v4();
    this.tenantId = tenantId;
    this.code = code;
    this.name = name;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
