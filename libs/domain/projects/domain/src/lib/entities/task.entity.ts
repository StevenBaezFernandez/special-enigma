import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
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

  @Property()
    description?: string;

  @Enum(() => TaskStatus)
  @Property()
  status: TaskStatus = TaskStatus.TODO;

    assignedToId?: string; // Reference to Employee ID

  @ManyToOne('Project')
  project!: Project;

  @Property()
    createdAt: Date = new Date();

  @Property()
    updatedAt: Date = new Date();

  constructor(tenantId: string, project: Project, name: string) {
    this.tenantId = tenantId;
    this.project = project;
    this.name = name;
  }
}
