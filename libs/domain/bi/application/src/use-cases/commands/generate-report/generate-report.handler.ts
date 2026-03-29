import { Injectable, Inject } from '@nestjs/common';
import { BiReport, type BiReportRepository, BI_REPORT_REPOSITORY } from '@virteex/domain-bi-domain';
import { ACCOUNTING_REPORTING_PORT, type IAccountingReportingPort } from '@virteex/domain-accounting-contracts';
import { GenerateReportCommand } from './generate-report.command';

@Injectable()
export class GenerateReportHandler {
  constructor(
    @Inject(BI_REPORT_REPOSITORY) private readonly repository: BiReportRepository,
    @Inject(ACCOUNTING_REPORTING_PORT) private readonly accountingReporting: IAccountingReportingPort
  ) {}

  async handle(command: GenerateReportCommand): Promise<BiReport> {
    const { dto } = command;
    const tenantId = dto.tenantId || dto.parameters?.tenantId || 'default';
    const totalEntries = await this.accountingReporting.countJournalEntries(tenantId);

    const realData = {
      summary: `Financial Report: ${dto.name}`,
      totalEntries,
      generatedAt: new Date(),
    };

    const report = new BiReport(
      tenantId,
      dto.name,
      dto.type,
      realData
    );

    await this.repository.save(report);
    return report;
  }
}
