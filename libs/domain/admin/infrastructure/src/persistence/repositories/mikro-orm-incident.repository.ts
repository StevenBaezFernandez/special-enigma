import { Injectable } from '@nestjs/common';
import { IncidentRepository, Incident } from '@virteex/domain-admin-domain';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { OrmIncident } from '../entities/incident.entity';

@Injectable()
export class MikroOrmIncidentRepository implements IncidentRepository {
  constructor(
    @InjectRepository(OrmIncident)
    private readonly repository: EntityRepository<OrmIncident>
  ) {}

  async save(incident: Incident): Promise<void> {
    let ormIncident = await this.repository.findOne({ id: incident.id });
    if (!ormIncident) {
      ormIncident = new OrmIncident();
      ormIncident.id = incident.id;
    }

    ormIncident.title = incident.title;
    ormIncident.severity = incident.severity;
    ormIncident.status = incident.status;
    ormIncident.service = incident.service;
    ormIncident.tenantId = incident.tenantId;
    ormIncident.createdAt = incident.createdAt;
    ormIncident.updatedAt = incident.updatedAt;

    await (this.repository as any).getEntityManager().persistAndFlush(ormIncident);
  }

  async findById(id: string): Promise<Incident | null> {
    const ormIncident = await this.repository.findOne({ id });
    if (!ormIncident) return null;
    return this.mapToDomain(ormIncident);
  }

  async findByTenant(tenantId: string): Promise<Incident[]> {
    const ormIncidents = await this.repository.find({ tenantId });
    return ormIncidents.map(orm => this.mapToDomain(orm));
  }

  private mapToDomain(orm: OrmIncident): Incident {
    const incident = new Incident();
    incident.id = orm.id;
    incident.title = orm.title;
    incident.severity = orm.severity;
    incident.status = orm.status;
    incident.service = orm.service;
    incident.tenantId = orm.tenantId;
    incident.createdAt = orm.createdAt;
    incident.updatedAt = orm.updatedAt;
    return incident;
  }
}
