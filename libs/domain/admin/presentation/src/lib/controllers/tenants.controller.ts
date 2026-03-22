import { Controller, Post, Get, Patch, Body, Param, Query, Logger, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { TenantSupportService, ProvisioningService } from '@virteex/domain-admin-application';
import { TenantService, TenantMode } from '@virteex/kernel-tenant';
import { StepUp, StepUpGuard } from '@virteex/kernel-auth';
import { type CreateTenantRequest } from '@virteex/domain-admin-contracts';

@ApiTags('Admin/Tenants')
@ApiHeader({ name: 'X-MFA-Token', description: 'Mandatory Multi-Factor Authentication Token for Admin access' })
@Controller('admin/tenants')
@UseGuards(StepUpGuard) // Mandatory MFA Check for all routes in this controller
@StepUp({ action: 'tenant-admin', maxAgeSeconds: 300 })
export class TenantsController {
  private readonly logger = new Logger(TenantsController.name);

  constructor(
      private readonly supportService: TenantSupportService,
      private readonly tenantService: TenantService,
      private readonly provisioningService: ProvisioningService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant (Automated Provisioning Flow)' })
  async createTenant(@Body() body: CreateTenantRequest) {
      this.logger.log(`ADMIN REQUEST: Provisioning new tenant: ${body.id}`);

      const tenant = await this.tenantService.createTenant({
          id: body.id,
          mode: body.mode as TenantMode,
          primaryRegion: body.primaryRegion || 'us-east-1',
          secondaryRegion: body.secondaryRegion || 'us-west-2',
          complianceProfile: 'standard',
          settings: {
              name: body.name,
              country: body.country,
              email: body.email,
              taxId: body.taxId,
              plan: body.plan
          },
          keys: {
              kmsKeyId: 'default-kms-id',
              signingKeyId: 'default-signing-id'
          },
          schemaName: body.mode === 'SCHEMA' ? `tenant_${body.id.toLowerCase()}` : undefined
      });

      // Start actual infrastructure provisioning
      await this.provisioningService.startProvisioning(tenant.id);

      return {
          id: tenant.id,
          status: 'PROVISIONING',
          message: 'Tenant provisioning initialized successfully. Check status endpoint for progress.'
      };
  }

  @Get(':id/provisioning-status')
  @ApiOperation({ summary: 'Get infrastructure provisioning status' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  async getProvisioningStatus(@Param('id') id: string) {
      return this.provisioningService.getStatus(id);
  }

  @Get()
  @ApiOperation({ summary: 'Search for tenants in the ecosystem' })
  @ApiQuery({ name: 'query', required: false })
  async searchTenants(@Query('query') query: string = '') {
      this.logger.log(`Admin search for tenants: ${query}`);
      return this.supportService.searchTenants(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed tenant status and health for support' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  async getTenantStatus(@Param('id') id: string) {
      this.logger.log(`Admin inspecting tenant health: ${id}`);
      return this.supportService.getTenantStatus(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Emergency provisioning or status update' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  async updateTenantStatus(
      @Param('id') id: string,
      @Body('status') status: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING',
      @Body('reason') reason: string
  ) {
      if (!reason) {
          throw new ForbiddenException('A reason is mandatory for manual status updates in production.');
      }
      this.logger.warn(`Admin action: Changing tenant ${id} status to ${status}. Reason: ${reason}`);
      await this.supportService.updateTenantStatus(id, status, reason);
      return { message: `Tenant ${id} status updated successfully to ${status}` };
  }
}
