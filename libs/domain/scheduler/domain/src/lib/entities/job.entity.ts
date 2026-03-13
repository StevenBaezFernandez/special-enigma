import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

export enum JobStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED_RETRYABLE = 'FAILED_RETRYABLE',
  FAILED_TERMINAL = 'FAILED_TERMINAL',
  RETRY_SCHEDULED = 'RETRY_SCHEDULED'
}

@Entity()
export class Job {
  @PrimaryKey()
  id!: string;

  @Property()
  type!: string;

  @Property({ type: 'json' })
  payload!: any;

  @Enum(() => JobStatus)
  status: JobStatus = JobStatus.PENDING;

  @Property()
  tenantId!: string;

  @Property()
  attempts: number = 0;

  @Property()
  maxAttempts: number = 3;

  @Property({ nullable: true })
  lastError?: string;

  @Property()
  priority: number = 0;

  @Property({ nullable: true })
  scheduledAt?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
