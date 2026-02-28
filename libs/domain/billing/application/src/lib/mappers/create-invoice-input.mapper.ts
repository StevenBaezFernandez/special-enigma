import { CreateInvoiceDto } from '../dtos/create-invoice.dto';

type CreateInvoiceInputLike = {
  tenantId?: string;
  customerId: string;
  dueDate: string;
  paymentForm: string;
  paymentMethod: string;
  usage: string;
  items: CreateInvoiceDto['items'];
};

export const mapCreateInvoiceInputToDto = (input: CreateInvoiceInputLike): CreateInvoiceDto => ({
  tenantId: input.tenantId,
  customerId: input.customerId,
  dueDate: input.dueDate,
  paymentForm: input.paymentForm,
  paymentMethod: input.paymentMethod,
  usage: input.usage,
  items: input.items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    productId: item.productId,
    taxRate: item.taxRate,
  }))
});
