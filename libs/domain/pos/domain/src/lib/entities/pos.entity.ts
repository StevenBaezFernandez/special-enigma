import { v4 } from 'uuid';

export enum PosSaleStatus {
  OPEN = 'OPEN',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export class PosSale {
  id: string = v4();
  tenantId!: string;
  terminalId!: string;
  total: string = '0.00';
  status: PosSaleStatus = PosSaleStatus.OPEN;
  items: PosSaleItem[] = [];
  createdAt: Date = new Date();

  constructor(tenantId: string, terminalId: string) {
    this.tenantId = tenantId;
    this.terminalId = terminalId;
  }
}

export class PosSaleItem {
  id: string = v4();
  productId!: string;
  productName!: string;
  price!: string;
  quantity!: number;
  sale!: PosSale;

  constructor(productId: string, productName: string, price: string, quantity: number) {
    this.productId = productId;
    this.productName = productName;
    this.price = price;
    this.quantity = quantity;
  }
}

export enum ShiftStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export class PosShift {
  id: string = v4();
  tenantId!: string;
  terminalId!: string;
  userId!: string;
  openingBalance!: string;
  closingBalance?: string;
  status: ShiftStatus = ShiftStatus.OPEN;
  openedAt: Date = new Date();
  closedAt?: Date;

  constructor(tenantId: string, terminalId: string, userId: string, openingBalance: string) {
    this.tenantId = tenantId;
    this.terminalId = terminalId;
    this.userId = userId;
    this.openingBalance = openingBalance;
  }
}

export abstract class PosRepository {
  abstract saveSale(sale: PosSale): Promise<void>;
  abstract findSaleById(id: string): Promise<PosSale | null>;
  abstract saveShift(shift: PosShift): Promise<void>;
  abstract findActiveShift(tenantId: string, terminalId: string): Promise<PosShift | null>;
}
