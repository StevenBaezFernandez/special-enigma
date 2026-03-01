import { ProjectStatus } from '@virteex/shared-contracts';
import type { Task } from './task.entity';

export class Project {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

    tenantId!: string;

    name!: string;

    description?: string;

    startDate!: Date;

    endDate?: Date;

  @Enum(() => ProjectStatus)
  status: ProjectStatus = ProjectStatus.PLANNED;

  @OneToMany('Task', 'project', { cascade: [Cascade.ALL] })
  tasks = new Collection<Task>(this);

    createdAt: Date = new Date();

    updatedAt: Date = new Date();

  constructor(tenantId: string, name: string, startDate: Date) {
    this.tenantId = tenantId;
    this.name = name;
    this.startDate = startDate;
  }
}
