import { Injectable, Inject } from '@nestjs/common';
import { CreateRequisitionDto } from '@virteex/contracts-purchasing-contracts';
import { Requisition, RequisitionRepository, REQUISITION_REPOSITORY } from '@virteex/domain-purchasing-domain';

@Injectable()
export class CreateRequisitionUseCase {
  constructor(
    @Inject(REQUISITION_REPOSITORY) private readonly repository: RequisitionRepository
  ) {}

  async execute(dto: CreateRequisitionDto, tenantId: string): Promise<Requisition> {
    const reqNumber = `REQ-${Date.now()}`;
    const requisition = new Requisition(tenantId, reqNumber, dto.requester, dto.department, new Date(dto.date), dto.items);
    await this.repository.save(requisition);
    return requisition;
  }
}
