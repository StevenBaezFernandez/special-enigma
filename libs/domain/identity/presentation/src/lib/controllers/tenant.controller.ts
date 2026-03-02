import { Controller, Get, UseGuards } from '@nestjs/common';
import { ListTenantsUseCase } from '@virteex/domain-identity-application';
import { Company } from '@virteex/domain-identity-domain';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, StepUpGuard, StepUp } from '@virteex/kernel-auth';

@ApiTags('Admin')
@Controller('admin/tenants')
@UseGuards(JwtAuthGuard, StepUpGuard)
export class TenantController {
  constructor(
    private readonly listTenantsUseCase: ListTenantsUseCase
  ) {}

  @Get()
  @StepUp({ action: 'tenant-admin', maxAgeSeconds: 300 })
  @ApiOperation({ summary: 'List all tenants' })
  async findAll(): Promise<Company[]> {
    return this.listTenantsUseCase.execute();
  }
}
