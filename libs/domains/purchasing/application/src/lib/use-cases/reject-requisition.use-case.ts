import { Injectable, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RequisitionRepository } from '@virteex/domain-purchasing-domain';

@Injectable()
export class RejectRequisitionUseCase {
  constructor(
    @Inject('RequisitionRepository') private readonly requisitionRepository: RequisitionRepository
  ) {}

  async execute(requisitionId: string, tenantId: string): Promise<void> {
    const requisition = await this.requisitionRepository.findById(requisitionId);

    if (!requisition) {
      throw new NotFoundException(`Requisition ${requisitionId} not found`);
    }

    if (requisition.tenantId !== tenantId) {
      throw new UnauthorizedException('Access denied');
    }

    requisition.status = 'Rejected';

    await this.requisitionRepository.save(requisition);
  }
}
