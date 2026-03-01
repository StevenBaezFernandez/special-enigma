// app/core/models/ledger.model.ts
export interface Ledger {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}