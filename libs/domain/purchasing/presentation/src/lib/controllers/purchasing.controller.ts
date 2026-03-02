import { Controller, Post, Body, Get, Put, Param, UnauthorizedException } from '@nestjs/common';
import {
  CreateSupplierUseCase, CreatePurchaseOrderUseCase,
  CreateRequisitionUseCase, GetRequisitionsUseCase,
  CreateVendorBillUseCase, UpdateVendorBillUseCase, GetVendorBillUseCase
} from '@virteex/domain-purchasing-application';
import {
  CreateSupplierDto, CreatePurchaseOrderDto,
  CreateRequisitionDto, CreateVendorBillDto, UpdateVendorBillDto
} from '@virteex/domain-purchasing-contracts';
import { getTenantContext } from '@virteex/kernel-auth';

@Controller('purchasing')
export class PurchasingController {
  constructor(
    private readonly createSupplierUseCase: CreateSupplierUseCase,
    private readonly createPurchaseOrderUseCase: CreatePurchaseOrderUseCase,
    private readonly createRequisitionUseCase: CreateRequisitionUseCase,
    private readonly getRequisitionsUseCase: GetRequisitionsUseCase,
    private readonly createVendorBillUseCase: CreateVendorBillUseCase,
    private readonly updateVendorBillUseCase: UpdateVendorBillUseCase,
    private readonly getVendorBillUseCase: GetVendorBillUseCase
  ) {}

  @Post('suppliers')
  async createSupplier(@Body() dto: CreateSupplierDto) {
    const context = getTenantContext();
    if (!context?.tenantId) {
        throw new UnauthorizedException('Tenant context is missing');
    }
    return this.createSupplierUseCase.execute(dto, context.tenantId);
  }

  @Post('orders')
  async createPurchaseOrder(@Body() dto: CreatePurchaseOrderDto) {
    const context = getTenantContext();
    if (!context?.tenantId) {
        throw new UnauthorizedException('Tenant context is missing');
    }
    return this.createPurchaseOrderUseCase.execute(dto, context.tenantId);
  }

  @Post('requisitions')
  async createRequisition(@Body() dto: CreateRequisitionDto) {
    const context = getTenantContext();
    if (!context?.tenantId) throw new UnauthorizedException('Tenant context is missing');
    return this.createRequisitionUseCase.execute(dto, context.tenantId);
  }

  @Get('requisitions')
  async getRequisitions() {
    const context = getTenantContext();
    if (!context?.tenantId) throw new UnauthorizedException('Tenant context is missing');
    return this.getRequisitionsUseCase.execute(context.tenantId);
  }

  @Post('bills')
  async createVendorBill(@Body() dto: CreateVendorBillDto) {
    const context = getTenantContext();
    if (!context?.tenantId) throw new UnauthorizedException('Tenant context is missing');
    return this.createVendorBillUseCase.execute(dto, context.tenantId);
  }

  @Put('bills/:id')
  async updateVendorBill(@Param('id') id: string, @Body() dto: UpdateVendorBillDto) {
    const context = getTenantContext();
    if (!context?.tenantId) throw new UnauthorizedException('Tenant context is missing');
    return this.updateVendorBillUseCase.execute(id, dto, context.tenantId);
  }

  @Get('bills/:id')
  async getVendorBill(@Param('id') id: string) {
    const context = getTenantContext();
    if (!context?.tenantId) throw new UnauthorizedException('Tenant context is missing');
    return this.getVendorBillUseCase.execute(id, context.tenantId);
  }
}
