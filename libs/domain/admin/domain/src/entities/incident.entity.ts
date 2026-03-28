export enum IncidentSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
}

export class Incident {
  id!: string;
  title!: string;
  severity: IncidentSeverity = IncidentSeverity.MEDIUM;
  status: IncidentStatus = IncidentStatus.OPEN;
  service!: string;
  tenantId?: string;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}
