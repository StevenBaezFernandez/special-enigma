import { VendorBill } from '../entities/vendor-bill.entity';

export const VENDOR_BILL_REPOSITORY = 'VENDOR_BILL_REPOSITORY';

export interface VendorBillRepository {
  save(bill: VendorBill): Promise<void>;
  findById(id: string): Promise<VendorBill | null>;
  findAll(tenantId: string): Promise<VendorBill[]>;
}
