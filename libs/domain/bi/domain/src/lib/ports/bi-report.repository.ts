import { BiReport } from '../entities/bi-report.entity';

export const BI_REPORT_REPOSITORY = 'BI_REPORT_REPOSITORY';

export interface BiReportRepository {
  save(report: BiReport): Promise<void>;
  findAll(tenantId: string): Promise<BiReport[]>;
  findById(id: string): Promise<BiReport | null>;
}
