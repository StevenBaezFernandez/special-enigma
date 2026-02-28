import { Injectable, Inject } from '@nestjs/common';
import { Requisition, RequisitionRepository, REQUISITION_REPOSITORY } from '@virteex/domain-purchasing-domain';

@Injectable()
export class GetRequisitionsUseCase {
  constructor(
    @Inject(REQUISITION_REPOSITORY) private readonly repository: RequisitionRepository
  ) {}

  async execute(tenantId: string): Promise<Requisition[]> {
    return this.repository.findAll(tenantId);
  }
}
