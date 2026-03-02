import { Cascade, Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { ProjectStatus } from '@virteex/shared-contracts';
import type { Task } from './task.entity';

@Entity()
export class Project {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
    tenantId!: string;

  @Property()
    name!: string;

  @Property()
    description?: string;

  @Property()
    startDate!: Date;

  @Property()
    endDate?: Date;

  @Enum(() => ProjectStatus)
  @Property()
  status: ProjectStatus = ProjectStatus.PLANNED;

  @OneToMany('Task', 'project', { cascade: [Cascade.ALL] })
  tasks = new Collection<Task>(this);

  @Property()
    createdAt: Date = new Date();

  @Property()
    updatedAt: Date = new Date();

  constructor(tenantId: string, name: string, startDate: Date) {
    this.tenantId = tenantId;
    this.name = name;
    this.startDate = startDate;
  }
}
