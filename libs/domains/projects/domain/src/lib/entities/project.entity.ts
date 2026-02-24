import { Entity, PrimaryKey, Property, Enum, OneToMany, Collection, Cascade } from '@mikro-orm/core';
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

  @Property({ nullable: true })
  description?: string;

  @Property()
  startDate!: Date;

  @Property({ nullable: true })
  endDate?: Date;

  @Enum(() => ProjectStatus)
  status: ProjectStatus = ProjectStatus.PLANNED;

  @OneToMany('Task', 'project', { cascade: [Cascade.ALL] })
  tasks = new Collection<Task>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, name: string, startDate: Date) {
    this.tenantId = tenantId;
    this.name = name;
    this.startDate = startDate;
  }
}
