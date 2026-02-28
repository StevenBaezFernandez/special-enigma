import { Attendance } from '../entities/attendance.entity';

export const ATTENDANCE_REPOSITORY = 'ATTENDANCE_REPOSITORY';

export interface AttendanceRepository {
  findByEmployeeAndPeriod(employeeId: string, start: Date, end: Date): Promise<Attendance[]>;
  save(attendance: Attendance): Promise<void>;
  countIncidences(employeeId: string, start: Date, end: Date): Promise<number>;
}
