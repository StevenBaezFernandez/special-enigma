import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker, Job as BullJob, QueueEvents } from 'bullmq';
import { Job, JobStatus } from '../domain/entities/job.entity';
import { JobStateMachine } from '../domain/job-state-machine';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class JobOrchestrator {
  private readonly logger = new Logger(JobOrchestrator.name);
  private readonly queues: Map<string, Queue> = new Map();

  constructor(private readonly em: EntityManager) {}

  async enqueue(job: Job): Promise<void> {
    const queueName = this.getQueueName(job.type);
    let queue = this.queues.get(queueName);

    if (!queue) {
      queue = new Queue(queueName, {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        defaultJobOptions: {
          attempts: job.maxAttempts,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          priority: job.priority,
          removeOnComplete: true,
          removeOnFail: false,
        },
      });
      this.queues.set(queueName, queue);
    }

    await queue.add(job.type, job.payload, {
      jobId: job.id,
      delay: job.scheduledAt ? Math.max(0, job.scheduledAt.getTime() - Date.now()) : 0,
    });

    JobStateMachine.transition(job, JobStatus.QUEUED);
    this.logger.log(`Job ${job.id} of type ${job.type} enqueued to BullMQ.`);
  }

  private getQueueName(jobType: string): string {
    // In Level 5, we could separate queues by tenant or priority
    return `jobs:${jobType.split('.')[0] || 'default'}`;
  }
}
