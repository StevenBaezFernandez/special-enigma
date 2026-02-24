import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { JobTitle, JobTitleRepository } from '@virteex/domain-identity-domain';

@Injectable()
export class MikroOrmJobTitleRepository implements JobTitleRepository {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<JobTitle[]> {
    return this.em.find(JobTitle, {});
  }

  async save(jobTitle: JobTitle): Promise<void> {
    await this.em.persistAndFlush(jobTitle);
  }

  async ensureDefaults(): Promise<void> {
    const count = await this.em.count(JobTitle, {});
    if (count > 0) return;

    const defaults = [
      'CEO', 'CTO', 'CFO', 'Manager', 'Developer', 'Designer',
      'Product Owner', 'Scrum Master', 'HR Specialist',
      'Sales Representative', 'Accountant'
    ];

    for (const title of defaults) {
      this.em.persist(new JobTitle(title));
    }
    await this.em.flush();
  }
}
