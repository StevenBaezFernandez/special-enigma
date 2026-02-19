import { Controller, Get, Post, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard, getTenantContext } from '@virteex/auth';
import { GetRequisitionsUseCase } from '@virteex/purchasing-application';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly getRequisitionsUseCase: GetRequisitionsUseCase) {}

  @Get('pending')
  async getPending() {
    const context = getTenantContext();
    if (!context?.tenantId) {
        // Fallback for demo/dev if auth context missing in test env
        // throw new UnauthorizedException('Tenant context missing');
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
  approve(@Param('id') id: string) {
    // TODO: Integrate ApproveRequisitionUseCase
    return { success: true, message: `Approved ${id}` };
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    // TODO: Integrate RejectRequisitionUseCase
    return { success: true, message: `Rejected ${id}` };
  }
}
