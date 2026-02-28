import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { VendorBill, VendorBillRepository, VENDOR_BILL_REPOSITORY } from '@virteex/domain-purchasing-domain';

@Injectable()
export class GetVendorBillUseCase {
  constructor(
    @Inject(VENDOR_BILL_REPOSITORY) private readonly repository: VendorBillRepository
  ) {}

  async execute(id: string, tenantId: string): Promise<VendorBill> {
    const bill = await this.repository.findById(id);
    if (!bill || bill.tenantId !== tenantId) {
      throw new NotFoundException('Vendor bill not found');
    }
    return bill;
  }
}
