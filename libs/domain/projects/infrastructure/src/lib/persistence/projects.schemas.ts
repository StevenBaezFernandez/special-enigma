import { EntitySchema, Cascade } from '@mikro-orm/core';
import { Project, Task } from '@virteex/domain-projects-domain';

export const ProjectSchema = new EntitySchema<Project>({
  class: Project,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    status: { type: 'string' },
    startDate: { type: 'Date' },
    endDate: { type: 'Date', nullable: true },
    tasks: { kind: '1:m', entity: 'Task', mappedBy: 'project', cascade: [Cascade.ALL] },
  },
});

export const TaskSchema = new EntitySchema<Task>({
  class: Task,
  properties: {
    id: { primary: true, type: 'uuid' },
    project: { kind: 'm:1', entity: 'Project' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    status: { type: 'string' },
    assignedTo: { type: 'string', nullable: true },
    dueDate: { type: 'Date', nullable: true },
  },
});
