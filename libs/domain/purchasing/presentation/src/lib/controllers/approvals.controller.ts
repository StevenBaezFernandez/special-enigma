import { Controller, Get, Post, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard, getTenantContext } from '@virteex/kernel-auth';
import { GetRequisitionsUseCase, ApproveRequisitionUseCase, RejectRequisitionUseCase } from '@virteex/domain-purchasing-application';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(
    private readonly getRequisitionsUseCase: GetRequisitionsUseCase,
    private readonly approveRequisitionUseCase: ApproveRequisitionUseCase,
    private readonly rejectRequisitionUseCase: RejectRequisitionUseCase
  ) {}

  @Get('pending')
  async getPending() {
    const context = getTenantContext();
    if (!context?.tenantId) {
        return [];
    }

    const requisitions = await this.getRequisitionsUseCase.execute(context.tenantId);

    return requisitions
      .filter(req => req.status === 'PENDING')
      .map(req => ({
        id: req.id,
        title: `Requisition #${req.number}`,
        requester: req.requesterName || 'Unknown',
        amount: req.total
      }));
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    const context = getTenantContext();
    if (!context?.tenantId) throw new UnauthorizedException();

    await this.approveRequisitionUseCase.execute(id, context.tenantId);
    return { success: true };
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    const context = getTenantContext();
    if (!context?.tenantId) throw new UnauthorizedException();

    await this.rejectRequisitionUseCase.execute(id, context.tenantId);
    return { success: true };
  }
}
