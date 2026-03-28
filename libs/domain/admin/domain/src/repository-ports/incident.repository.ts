import { Incident } from '../entities/incident.entity';

export const INCIDENT_REPOSITORY = 'INCIDENT_REPOSITORY';

export interface IncidentRepository {
  save(incident: Incident): Promise<void>;
  findById(id: string): Promise<Incident | null>;
  findByTenant(tenantId: string): Promise<Incident[]>;
}
