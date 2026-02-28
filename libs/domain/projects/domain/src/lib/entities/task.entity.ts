import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { TaskStatus } from '@virteex/shared-contracts';
import type { Project } from './project.entity';

@Entity()
export class Task {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Enum(() => TaskStatus)
  status: TaskStatus = TaskStatus.TODO;

  @Property({ nullable: true })
  assignedToId?: string; // Reference to Employee ID

  @ManyToOne('Project')
  project!: Project;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, project: Project, name: string) {
    this.tenantId = tenantId;
    this.project = project;
    this.name = name;
  }
}
