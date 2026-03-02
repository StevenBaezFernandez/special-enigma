import { Controller, Post, Body, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard, TenantGuard, StepUpGuard, StepUp, getTenantContext } from '@virteex/kernel-auth';
import { UpdateSubscriptionUseCase, UpdateSubscriptionDto, GetSubscriptionStatusUseCase } from '@virteex/domain-identity-application';

@Controller('subscription')
@UseGuards(JwtAuthGuard, TenantGuard, StepUpGuard)
export class SubscriptionController {
  constructor(
    private readonly updateSubscriptionUseCase: UpdateSubscriptionUseCase,
    private readonly getSubscriptionStatusUseCase: GetSubscriptionStatusUseCase
  ) {}

  @Post('upgrade')
  @StepUp({ action: 'billing', maxAgeSeconds: 300 })
  async upgrade(@Body() dto: UpdateSubscriptionDto) {
    const context = getTenantContext();
    if (!context?.tenantId) throw new UnauthorizedException();
    return this.updateSubscriptionUseCase.execute(context.tenantId, dto);
  }

  @Get('status')
  async getStatus() {
    const context = getTenantContext();
    if (!context?.tenantId) throw new UnauthorizedException();
    return this.getSubscriptionStatusUseCase.execute(context.tenantId);
  }
}
