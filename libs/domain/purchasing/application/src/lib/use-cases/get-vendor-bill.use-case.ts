import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { VendorBill, VendorBillRepository, VENDOR_BILL_REPOSITORY } from '@virteex/domain-purchasing-domain';

@Injectable()
export class GetVendorBillUseCase {
  constructor(
    @Inject(VENDOR_BILL_REPOSITORY) private readonly repository: VendorBillRepository
  ) {}

  async execute(id: string, tenantId: string): Promise<VendorBill> {
    const bill = await this.repository.findById(id);
    if (!bill || bill.tenantId !== tenantId) {
      throw new DomainException('Vendor bill not found', 'ENTITY_NOT_FOUND');
    }
    return bill;
  }
}
