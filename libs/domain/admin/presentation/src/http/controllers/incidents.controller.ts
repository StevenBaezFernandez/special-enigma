import { Controller, Get, Patch, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IncidentService } from '@virteex/domain-admin-application';

@ApiTags('Admin/Incidents')
@Controller('admin/incidents')
export class IncidentsController {
  constructor(private readonly incidentService: IncidentService) {}

  @Get()
  @ApiOperation({ summary: 'List operational incidents' })
  async list() {
    return this.incidentService.listIncidents();
  }

  @Patch(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an incident' })
  async acknowledge(@Param('id') id: string) {
    await this.incidentService.acknowledgeIncident(id);
    return { message: 'Incident acknowledged' };
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve an incident' })
  async resolve(@Param('id') id: string) {
    await this.incidentService.resolveIncident(id);
    return { message: 'Incident resolved' };
  }
}
