export enum ClosingTaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export class ClosingTask {
  id!: string;
  tenantId!: string;
  fiscalPeriodId!: string;
  title!: string;
  status: ClosingTaskStatus = ClosingTaskStatus.PENDING;
  description!: string;
  requiredEvidence: boolean = false;
  evidenceProvided: boolean = false;
  evidenceUrl?: string;
  completedAt?: Date;
  completedBy?: string;

  constructor(tenantId: string, fiscalPeriodId: string, title: string, description: string) {
    this.tenantId = tenantId;
    this.fiscalPeriodId = fiscalPeriodId;
    this.title = title;
    this.description = description;
  }

  complete(userId: string, evidenceUrl?: string): void {
    if (this.requiredEvidence && !evidenceUrl) {
      throw new Error(`Evidence is required for task: ${this.title}`);
    }
    this.status = ClosingTaskStatus.COMPLETED;
    this.evidenceProvided = !!evidenceUrl;
    this.evidenceUrl = evidenceUrl;
    this.completedAt = new Date();
    this.completedBy = userId;
  }

  reset(): void {
    this.status = ClosingTaskStatus.PENDING;
    this.evidenceProvided = false;
    this.evidenceUrl = undefined;
    this.completedAt = undefined;
    this.completedBy = undefined;
  }
}
