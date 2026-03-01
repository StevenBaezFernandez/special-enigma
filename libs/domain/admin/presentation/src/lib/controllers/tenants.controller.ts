import { Controller, Post, Get, Patch, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TenantSupportService } from '@virteex/application-admin-application';

@ApiTags('Admin/Tenants')
@Controller('admin/tenants')
export class TenantsController {
  private readonly logger = new Logger(TenantsController.name);

  constructor(private readonly supportService: TenantSupportService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  async createTenant(@Body() body: any) {
      this.logger.log(`Provisioning new tenant: ${body.name}`);
      return { id: 'new-tenant-id', ...body, status: 'ACTIVE' };
  }

  @Get()
  @ApiOperation({ summary: 'Search for tenants' })
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
      this.logger.warn(`Admin action: Changing tenant ${id} status to ${status}. Reason: ${reason}`);
      await this.supportService.updateTenantStatus(id, status, reason);
      return { message: `Tenant ${id} status updated successfully to ${status}` };
  }
}
