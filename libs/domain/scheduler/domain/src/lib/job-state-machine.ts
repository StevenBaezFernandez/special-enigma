import { Job, JobStatus } from './entities/job.entity';

export class JobStateMachine {
  static transition(job: Job, nextStatus: JobStatus, error?: string): void {
    job.status = nextStatus;
    if (error) {
      job.lastError = error;
    }
    if (nextStatus === JobStatus.RUNNING) {
      job.attempts++;
    }
  }
}
