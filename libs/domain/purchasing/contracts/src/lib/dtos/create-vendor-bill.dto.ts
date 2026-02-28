export interface VendorBillLineItemDto {
  description: string;
  quantity: number;
  price: number;
  expenseAccountId: string;
}

export interface CreateVendorBillDto {
  supplierId: string;
  billNumber: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
  lineItems: VendorBillLineItemDto[];
}

export type UpdateVendorBillDto = Partial<CreateVendorBillDto>
