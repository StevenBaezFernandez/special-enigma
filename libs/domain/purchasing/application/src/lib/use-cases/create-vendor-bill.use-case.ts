import { Injectable, Inject } from '@nestjs/common';
import { CreateVendorBillDto } from '@virteex/contracts-purchasing-contracts';
import { VendorBill, VendorBillRepository, VENDOR_BILL_REPOSITORY } from '@virteex/domain-purchasing-domain';

@Injectable()
export class CreateVendorBillUseCase {
  constructor(
    @Inject(VENDOR_BILL_REPOSITORY) private readonly repository: VendorBillRepository
  ) {}

  async execute(dto: CreateVendorBillDto, tenantId: string): Promise<VendorBill> {
    const bill = new VendorBill(
      tenantId,
      dto.supplierId,
      dto.billNumber,
      new Date(dto.issueDate),
      new Date(dto.dueDate),
      dto.lineItems
    );
    if (dto.notes) bill.notes = dto.notes;
    await this.repository.save(bill);
    return bill;
  }
}
