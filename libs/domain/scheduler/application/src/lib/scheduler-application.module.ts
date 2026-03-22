import { Module } from '@nestjs/common';
import { JobProcessorService } from './job-processor.service';
import { JobOrchestrator } from './job-orchestrator';
import { SchedulerService } from './scheduler.service';
import { FiscalJobHandler } from './handlers/fiscal-job.handler';
import { BillingJobHandler } from './handlers/billing-job.handler';
import { NotificationApplicationModule } from '@virteex/domain-notification-application';

@Module({
  imports: [NotificationApplicationModule],
  providers: [
    JobProcessorService,
    JobOrchestrator,
    SchedulerService,
    FiscalJobHandler,
    BillingJobHandler,
  ],
  exports: [SchedulerService, JobOrchestrator, JobProcessorService],
})
export class SchedulerApplicationModule {}
