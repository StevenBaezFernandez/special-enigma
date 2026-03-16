import { Injectable } from '@nestjs/common';
import { type BiReportRepository } from '@virteex/domain-bi-domain';
import { BiReport } from '@virteex/domain-bi-domain';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class MikroOrmBiReportRepository implements BiReportRepository {
  constructor(
    @InjectRepository(BiReport)
    private readonly repository: EntityRepository<BiReport>
  ) {}

  async save(report: BiReport): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(report);
  }

  async findAll(tenantId: string): Promise<BiReport[]> {
    return this.repository.find({ tenantId });
  }

  async findById(id: string): Promise<BiReport | null> {
    return this.repository.findOne({ id });
  }
}
