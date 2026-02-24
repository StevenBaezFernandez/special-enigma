import { Injectable } from '@nestjs/common';
import { JobTitleRepository, JobTitle } from '@virteex/domain-identity-domain';

@Injectable()
export class GetJobTitlesUseCase {
  constructor(private readonly jobTitleRepository: JobTitleRepository) {}

  async execute(): Promise<JobTitle[]> {
    await this.jobTitleRepository.ensureDefaults();
    return this.jobTitleRepository.findAll();
  }
}
