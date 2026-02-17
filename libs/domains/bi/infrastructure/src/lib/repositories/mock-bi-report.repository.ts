import { Injectable } from '@nestjs/common';
import { BiReport, BiReportRepository } from '@virteex/bi-domain';

@Injectable()
export class MockBiReportRepository implements BiReportRepository {
  async save(report: BiReport): Promise<void> {
    // Mock save
  }
  async findById(id: string): Promise<BiReport | null> {
    return null;
  }
  async findAll(): Promise<BiReport[]> {
    return [];
  }
}
