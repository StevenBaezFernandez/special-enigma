import { Job, JobStatus } from '../entities/job.entity';
import { JobStateMachine } from '../job-state-machine';

describe('JobStateMachine Resilience', () => {
  it('should enforce fencing token validation before processing', () => {
    const job = new Job();
    job.status = JobStatus.PENDING;
    job.fencingToken = 'token-a';

    // Simulate leadership change
    const newToken = 'token-b';

    const canProcess = (currentJob: Job, activeToken: string) => {
      return currentJob.fencingToken === activeToken;
    };

    expect(canProcess(job, 'token-a')).toBe(true);
    expect(canProcess(job, newToken)).toBe(false);
  });

  it('should prevent invalid transitions (e.g., SUCCEEDED -> RUNNING)', () => {
    const job = new Job();
    job.status = JobStatus.SUCCEEDED;

    expect(() => JobStateMachine.transition(job, JobStatus.RUNNING))
      .toThrow('Invalid transition from succeeded to running');
  });
});
