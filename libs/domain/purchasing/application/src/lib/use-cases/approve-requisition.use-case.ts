import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { RequisitionRepository } from '@virteex/domain-purchasing-domain';

@Injectable()
export class ApproveRequisitionUseCase {
  constructor(
    @Inject('RequisitionRepository') private readonly requisitionRepository: RequisitionRepository
  ) {}

  async execute(requisitionId: string, tenantId: string): Promise<void> {
    const requisition = await this.requisitionRepository.findById(requisitionId);

    if (!requisition) {
      throw new DomainException(`Requisition ${requisitionId} not found`, 'ENTITY_NOT_FOUND');
    }

    if (requisition.tenantId !== tenantId) {
      throw new DomainException('Access denied', 'UNAUTHORIZED');
    }

    requisition.status = 'Approved';
    // Ideally, we would emit an event here (e.g., requisition.approved)

    await this.requisitionRepository.save(requisition);
  }
}
