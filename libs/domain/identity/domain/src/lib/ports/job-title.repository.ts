import { JobTitle } from '../entities/job-title.entity';

export abstract class JobTitleRepository {
  abstract findAll(): Promise<JobTitle[]>;
  abstract save(jobTitle: JobTitle): Promise<void>;
  abstract ensureDefaults(): Promise<void>;
}
