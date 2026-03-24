export interface CreateRequisitionDto {
  requester: string;
  department: string;
  date: string;
  items: { productId: string; description: string; quantity: number; unitPrice: number }[];
}
