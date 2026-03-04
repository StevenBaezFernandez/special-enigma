import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResidencyComplianceService } from '../residency-compliance.service';

@ApiTags('Residency Auditor')
@Controller('internal/auditor/residency')
export class ResidencyAuditorController {
  constructor(private readonly residencyCompliance: ResidencyComplianceService) {}

  @Get('events')
  async getEvents(
    @Query('tenantId') tenantId?: string,
    @Query('region') region?: string,
    @Query('limit') limit?: string
  ) {
    return this.residencyCompliance.getAuditorEvents({
      tenantId,
      region,
      limit: limit ? Number.parseInt(limit, 10) : undefined,
    });
  }

  @Get('dashboard')
  async getDashboard(@Query('tenantId') tenantId?: string, @Query('region') region?: string) {
    return this.residencyCompliance.getComplianceDashboard({ tenantId, region });
  }

  @Post('replication/authorize')
  async authorizeReplication(
    @Body()
    body: {
      tenantId: string;
      sourceRegion: string;
      targetRegion: string;
      resource: 'database' | 'queue' | 'storage' | 'replication';
      actorId: string;
      actorRoles: string[];
      payload?: unknown;
      reason: string;
    }
  ) {
    return this.residencyCompliance.authorizeReplication(body);
  }
}
