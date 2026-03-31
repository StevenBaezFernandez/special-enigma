import { ClosingTask } from '../entities/closing-task.entity';

export interface ClosingTaskRepository {
  create(task: ClosingTask): Promise<ClosingTask>;
  findById(tenantId: string, id: string): Promise<ClosingTask | null>;
  findByFiscalPeriod(tenantId: string, fiscalPeriodId: string): Promise<ClosingTask[]>;
  save(task: ClosingTask): Promise<ClosingTask>;
}

export const CLOSING_TASK_REPOSITORY = 'CLOSING_TASK_REPOSITORY';
