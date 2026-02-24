import { Injectable, Inject } from '@nestjs/common';
import { BiReport, BiReportRepository, BI_REPORT_REPOSITORY } from '@virteex/domain-bi-domain';
import { JOURNAL_ENTRY_REPOSITORY, JournalEntryRepository } from '@virteex/domain-accounting-domain';

export class GenerateReportDto {
  name!: string;
  type!: string;
  parameters?: any;
  tenantId?: string;
}

@Injectable()
export class GenerateReportUseCase {
  constructor(
    @Inject(BI_REPORT_REPOSITORY) private readonly repository: BiReportRepository,
    @Inject(JOURNAL_ENTRY_REPOSITORY) private readonly journalEntryRepository: JournalEntryRepository
  ) {}

  async execute(dto: GenerateReportDto): Promise<BiReport> {
    const tenantId = dto.tenantId || dto.parameters?.tenantId || 'default';
    const totalEntries = await this.journalEntryRepository.count(tenantId);

    const realData = {
      summary: `Financial Report: ${dto.name}`,
      totalEntries,
      generatedAt: new Date(),
    };

    const report = new BiReport(dto.name, dto.type, realData);
    await this.repository.save(report);
    return report;
  }
}
