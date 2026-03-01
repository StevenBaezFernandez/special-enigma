import { Controller, Post, Body } from '@nestjs/common';

@Controller('admin/tenants')
export class TenantsController {
  @Post()
  async createTenant(@Body() body: any) {
      return { id: 'new-tenant-id', ...body, status: 'ACTIVE' };
  }
}
