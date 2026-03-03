import { Job, JobStatus, JobAttempt } from './job.entity';

export class JobStateMachine {
  private static readonly transitions: Record<JobStatus, JobStatus[]> = {
    [JobStatus.PENDING]: [JobStatus.QUEUED, JobStatus.CANCELLED],
    [JobStatus.QUEUED]: [JobStatus.RUNNING, JobStatus.CANCELLED, JobStatus.PENDING],
    [JobStatus.RUNNING]: [JobStatus.SUCCEEDED, JobStatus.RETRY_SCHEDULED, JobStatus.FAILED_TERMINAL, JobStatus.DEAD_LETTERED],
    [JobStatus.RETRY_SCHEDULED]: [JobStatus.QUEUED, JobStatus.CANCELLED],
    [JobStatus.SUCCEEDED]: [],
    [JobStatus.FAILED_TERMINAL]: [],
    [JobStatus.CANCELLED]: [],
    [JobStatus.DEAD_LETTERED]: [JobStatus.RETRY_SCHEDULED], // Replay possibility
  };

  static canTransition(from: JobStatus, to: JobStatus): boolean {
    return this.transitions[from].includes(to);
  }

  static transition(job: Job, to: JobStatus, reason?: string, metadata?: Record<string, any>): JobAttempt {
    if (!this.canTransition(job.status, to)) {
      throw new Error(`Invalid transition from ${job.status} to ${to}`);
    }

    job.status = to;
    if (to === JobStatus.RUNNING) {
      job.startedAt = new Date();
      job.attempts++;
    } else if (to === JobStatus.SUCCEEDED || to === JobStatus.FAILED_TERMINAL || to === JobStatus.DEAD_LETTERED) {
      job.finishedAt = new Date();
    }

    if (reason) {
      job.lastError = reason;
    }

    const attempt = new JobAttempt();
    attempt.job = job;
    attempt.status = to;
    attempt.attemptNumber = job.attempts;
    attempt.error = reason;
    attempt.metadata = metadata;
    attempt.occurredAt = new Date();

    job.history.add(attempt);
    return attempt;
  }
}
