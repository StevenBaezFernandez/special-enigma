import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Attendance, AttendanceRepository } from '@virteex/payroll-domain';

@Injectable()
export class MikroOrmAttendanceRepository implements AttendanceRepository {
  constructor(
    @InjectRepository(Attendance)
    private readonly repository: EntityRepository<Attendance>
  ) {}

  async save(attendance: Attendance): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(attendance);
  }

  async findByEmployeeAndPeriod(employeeId: string, start: Date, end: Date): Promise<Attendance[]> {
     return this.repository.find({
      employee: { id: employeeId },
      date: { $gte: start, $lte: end }
    } as any);
  }

  async countIncidences(employeeId: string, startDate: Date, endDate: Date): Promise<number> {
    return this.repository.count({
      employee: { id: employeeId },
      date: { $gte: startDate, $lte: endDate },
      type: { $ne: 'PRESENT' }
    } as any);
  }
}
