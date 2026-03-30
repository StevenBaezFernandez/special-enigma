import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job as BullJob } from 'bullmq';
import { EntityManager } from '@mikro-orm/core';
import { Job, JobStatus } from '@virteex/domain-scheduler-domain';
import { JobStateMachine } from '@virteex/domain-scheduler-domain';
import { InboxService } from '@virteex/kernel-messaging';
import { FiscalJobHandler } from './handlers/fiscal-job.handler';
import { BillingJobHandler } from './handlers/billing-job.handler';
import { runWithRequiredTenantContext } from '@virteex/kernel-auth';

@Injectable()
export class JobProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobProcessorService.name);
  private worker: Worker | null = null;

  constructor(
    private readonly em: EntityManager,
    private readonly inboxService: InboxService,
    private readonly fiscalHandler: FiscalJobHandler,
    private readonly billingHandler: BillingJobHandler
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      'jobs:default', // Simplified for Step 4
      async (bullJob: BullJob) => {
        const jobId = bullJob.opts.jobId;
        if (!jobId) return;

        await this.inboxService.process(jobId, 'job-worker-1', async () => {
          await this.executeJob(jobId);
        });
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      }
    );
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
  }

  private async executeJob(jobId: string) {
    const job = await this.em.findOne(Job, { id: jobId });
    if (!job) {
      this.logger.error(`Job ${jobId} not found in database.`);
      return;
    }

    if (job.payload?.['tenantId'] && job.payload['tenantId'] !== job.tenantId) {
      throw new Error(`Job ${job.id} has mismatched tenant context payload.`);
    }

    JobStateMachine.transition(job, JobStatus.RUNNING);
    await this.em.flush();

    try {
      this.logger.log(`Executing job ${jobId} of type ${job.type}`);

      await runWithRequiredTenantContext({
        tenantId: job.tenantId,
        userId: 'system-worker',
        role: ['worker'],
        permissions: ['job:execute'],
        region: (job.payload?.['region'] as string) || process.env['AWS_REGION'] || 'us-east-1',
        currency: (job.payload?.['currency'] as string) || 'USD',
        language: (job.payload?.['language'] as string) || 'en',
        contextVersion: 'v1',
        exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
      }, async () => this.routeJobExecution(job));

      JobStateMachine.transition(job, JobStatus.SUCCEEDED);
    } catch (err: any) {
      this.logger.error(`Error executing job ${jobId}: ${err.message}`);
      if (job.attempts < job.maxAttempts) {
        JobStateMachine.transition(job, JobStatus.RETRY_SCHEDULED, err.message);
      } else {
        JobStateMachine.transition(job, JobStatus.FAILED_TERMINAL, err.message);
      }
    } finally {
      await this.em.flush();
    }
  }

  private async routeJobExecution(job: Job): Promise<void> {
    this.logger.debug(`Routing job execution for ${job.type}`);

    switch (job.type) {
      case 'fiscal.invoice_issued':
        await this.fiscalHandler.handleInvoiceIssued(job);
        break;
      case 'billing.payment_failed':
        await this.billingHandler.handlePaymentFailed(job);
        break;
      case 'notification.send':
        // General notification dispatch
        break;
      default:
        this.logger.warn(`Unsupported job type: ${job.type}`);
    }

    if (job.status !== JobStatus.RUNNING) {
      throw new Error(`Cannot execute job ${job.id} in state ${job.status}`);
    }
  }
}
