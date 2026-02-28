export interface CreateRequisitionDto {
  requester: string;
  department: string;
  date: string;
  items: { description: string; quantity: number; unitPrice: number }[];
}
