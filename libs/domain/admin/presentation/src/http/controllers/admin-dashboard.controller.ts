import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminDashboardService } from '../../../../application/src/services/admin-dashboard.service';

@ApiTags('Admin')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('metrics')
  async getMetrics() {
    return this.dashboardService.getMetrics();
  }
}
