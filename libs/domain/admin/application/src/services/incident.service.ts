import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Incident, IncidentStatus } from '@virteex/domain-admin-domain';

@Injectable()
export class IncidentService {
  private readonly logger = new Logger(IncidentService.name);

  constructor(private readonly em: EntityManager) {}

  async listIncidents(): Promise<Incident[]> {
    return this.em.find(Incident, {}, { orderBy: { createdAt: 'DESC' } });
  }

  async acknowledgeIncident(id: string): Promise<void> {
    const incident = await this.em.findOneOrFail(Incident, { id });
    incident.status = IncidentStatus.ACKNOWLEDGED;
    await this.em.flush();
  }

  async resolveIncident(id: string): Promise<void> {
    const incident = await this.em.findOneOrFail(Incident, { id });
    incident.status = IncidentStatus.RESOLVED;
    await this.em.flush();
  }
}
