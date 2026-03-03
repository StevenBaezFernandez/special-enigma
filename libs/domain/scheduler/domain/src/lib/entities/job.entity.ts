import { Entity, PrimaryKey, Property, Enum, OneToMany, Collection, Index } from '@mikro-orm/core';
import { v4 } from 'uuid';

export enum JobStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  RUNNING = 'running',
  RETRY_SCHEDULED = 'retry_scheduled',
  SUCCEEDED = 'succeeded',
  FAILED_TERMINAL = 'failed_terminal',
  CANCELLED = 'cancelled',
  DEAD_LETTERED = 'dead_lettered',
}

@Entity({ tableName: 'jobs' })
@Index({ properties: ['tenantId', 'status'] })
@Index({ properties: ['tenantId', 'idempotencyKey', 'type'], unique: true })
export class Job {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  type!: string;

  @Enum(() => JobStatus)
  status: JobStatus = JobStatus.PENDING;

  @Property({ type: 'json' })
  payload!: Record<string, any>;

  @Property({ nullable: true })
  idempotencyKey?: string;

  @Property()
  priority: number = 0;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  scheduledAt?: Date;

  @Property({ nullable: true })
  startedAt?: Date;

  @Property({ nullable: true })
  finishedAt?: Date;

  @Property({ default: 0 })
  attempts: number = 0;

  @Property({ default: 3 })
  maxAttempts: number = 3;

  @Property({ nullable: true })
  lastError?: string;

  @OneToMany(() => JobAttempt, (attempt) => attempt.job)
  history = new Collection<JobAttempt>(this);

  @Property({ nullable: true })
  fencingToken?: string;
}

@Entity({ tableName: 'job_attempts' })
export class JobAttempt {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ type: 'uuid', persist: false })
  jobId!: string;

  @Property({ type: 'Job', mapToPk: true })
  job!: Job;

  @Property()
  attemptNumber!: number;

  @Enum(() => JobStatus)
  status!: JobStatus;

  @Property({ nullable: true, type: 'text' })
  error?: string;

  @Property({ nullable: true, type: 'json' })
  metadata?: Record<string, any>;

  @Property()
  occurredAt: Date = new Date();
}
