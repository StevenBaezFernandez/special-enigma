import { Requisition } from '../entities/requisition.entity';

export const REQUISITION_REPOSITORY = 'REQUISITION_REPOSITORY';

export interface RequisitionRepository {
  save(requisition: Requisition): Promise<void>;
  findAll(tenantId: string): Promise<Requisition[]>;
  findById(id: string): Promise<Requisition | null>;
}
