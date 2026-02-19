import { Injectable, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RequisitionRepository } from '@virteex/purchasing-domain';

@Injectable()
export class ApproveRequisitionUseCase {
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

    requisition.status = 'APPROVED';
    // Ideally, we would emit an event here (e.g., requisition.approved)

    await this.requisitionRepository.save(requisition);
  }
}
