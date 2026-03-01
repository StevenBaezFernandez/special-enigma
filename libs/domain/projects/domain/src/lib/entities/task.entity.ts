import { TaskStatus } from '@virteex/shared-contracts';
import type { Project } from './project.entity';

export class Task {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

    tenantId!: string;

    name!: string;

    description?: string;

  @Enum(() => TaskStatus)
  status: TaskStatus = TaskStatus.TODO;

    assignedToId?: string; // Reference to Employee ID

  @ManyToOne('Project')
  project!: Project;

    createdAt: Date = new Date();

    updatedAt: Date = new Date();

  constructor(tenantId: string, project: Project, name: string) {
    this.tenantId = tenantId;
    this.project = project;
    this.name = name;
  }
}
