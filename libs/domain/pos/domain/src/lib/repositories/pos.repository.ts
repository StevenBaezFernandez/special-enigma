import { PosSale, PosShift } from '../entities/pos.entity';

export interface PosRepository {
  saveSale(sale: PosSale): Promise<void>;
  findSaleById(id: string): Promise<PosSale | null>;
  saveShift(shift: PosShift): Promise<void>;
  findActiveShift(tenantId: string, terminalId: string): Promise<PosShift | null>;
}
