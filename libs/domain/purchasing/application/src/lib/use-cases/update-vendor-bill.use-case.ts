import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { UpdateVendorBillDto } from '@virteex/domain-purchasing-contracts';
import { VendorBill, VendorBillRepository, VENDOR_BILL_REPOSITORY } from '@virteex/domain-purchasing-domain';

@Injectable()
export class UpdateVendorBillUseCase {
  constructor(
    @Inject(VENDOR_BILL_REPOSITORY) private readonly repository: VendorBillRepository
  ) {}

  async execute(id: string, dto: UpdateVendorBillDto, tenantId: string): Promise<VendorBill> {
    const bill = await this.repository.findById(id);
    if (!bill || bill.tenantId !== tenantId) {
      throw new DomainException('Vendor bill not found', 'ENTITY_NOT_FOUND');
    }

    if (dto.supplierId) bill.supplierId = dto.supplierId;
    if (dto.billNumber) bill.billNumber = dto.billNumber;
    if (dto.issueDate) bill.issueDate = new Date(dto.issueDate);
    if (dto.dueDate) bill.dueDate = new Date(dto.dueDate);
    if (dto.notes !== undefined) bill.notes = dto.notes;
    if (dto.lineItems) {
      bill.lineItems = dto.lineItems;
      bill.totalAmount = dto.lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2);
    }

    await this.repository.save(bill);
    return bill;
  }
}
