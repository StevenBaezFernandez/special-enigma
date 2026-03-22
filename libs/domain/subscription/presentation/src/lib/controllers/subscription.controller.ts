import { Controller, Get, Post, Body, UseGuards, Query, Put, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentTenant } from '@virteex/shared-util-server-server-config';
import { JwtAuthGuard, TenantGuard } from '@virteex/kernel-auth';
import { SubscribeToPlanUseCase, SubscribeToPlanDto, ChangeSubscriptionPlanUseCase, ChangeSubscriptionPlanDto, GetSubscriptionUseCase, CreateCheckoutSessionUseCase, CreateCheckoutSessionDto, CreatePortalSessionUseCase, CreatePortalSessionDto, GetSubscriptionPlansUseCase } from '@virteex/domain-subscription-application';

@ApiTags('Subscription')
@Controller('subscription')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
export class SubscriptionController {
  constructor(
    private readonly subscribeToPlanUseCase: SubscribeToPlanUseCase,
    private readonly changeSubscriptionPlanUseCase: ChangeSubscriptionPlanUseCase,
    private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private readonly createPortalSessionUseCase: CreatePortalSessionUseCase,
    private readonly getSubscriptionPlansUseCase: GetSubscriptionPlansUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Subscribe to a plan (Direct)' })
  async subscribe(@Body() dto: SubscribeToPlanDto, @CurrentTenant() tenantId: string) {
    // Only allow tenantId from token
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required from authentication token');
    }
    dto.tenantId = tenantId;
    return await this.subscribeToPlanUseCase.execute(dto);
  }

  @Put('change-plan')
  @ApiOperation({ summary: 'Change subscription plan' })
  async changePlan(@Body() dto: ChangeSubscriptionPlanDto, @CurrentTenant() tenantId: string) {
    // Only allow tenantId from token
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required from authentication token');
    }
    dto.tenantId = tenantId;
    return await this.changeSubscriptionPlanUseCase.execute(dto);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Create Stripe Checkout Session' })
  async createCheckout(@Body() dto: CreateCheckoutSessionDto, @CurrentTenant() tenantId: string) {
    // Only allow tenantId from token
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required from authentication token');
    }
    dto.tenantId = tenantId;
    return { url: await this.createCheckoutSessionUseCase.execute(dto) };
  }

  @Post('portal')
  @ApiOperation({ summary: 'Create Stripe Portal Session' })
  async createPortal(@Body() dto: CreatePortalSessionDto) {
    return { url: await this.createPortalSessionUseCase.execute(dto) };
  }

  @Get()
  @ApiOperation({ summary: 'Get subscription by tenant' })
  async findOne(@CurrentTenant() tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required from authentication token');
    }
    return await this.getSubscriptionUseCase.execute(tenantId);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  async getPlans() {
    return await this.getSubscriptionPlansUseCase.execute();
  }
}
