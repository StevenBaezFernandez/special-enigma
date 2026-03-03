import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { OutboxService } from '@virteex/kernel-messaging';
import { Job } from '../domain/entities/job.entity';
import { JobOrchestrator } from './job-orchestrator';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly em: EntityManager,
    private readonly outboxService: OutboxService,
    private readonly orchestrator: JobOrchestrator
  ) {}

  async createJob(data: Partial<Job>): Promise<Job> {
    const job = new Job();
    Object.assign(job, data);
    this.em.persist(job);

    await this.outboxService.add({
      aggregateType: 'Job',
      aggregateId: job.id,
      eventType: 'job.created',
      payload: { jobId: job.id, tenantId: job.tenantId, type: job.type },
    });

    return job;
  }
}
