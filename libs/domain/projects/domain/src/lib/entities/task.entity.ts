
import { TaskStatus } from '@virteex/shared-contracts';
import type { Project } from './project.entity';


export class Task {

  id!: string;


    tenantId!: string;


    name!: string;


    description?: string;



  status: TaskStatus = TaskStatus.TODO;

    assignedToId?: string; // Reference to Employee ID


  project!: Project;


    createdAt: Date = new Date();


    updatedAt: Date = new Date();

  constructor(tenantId: string, project: Project, name: string) {
    this.tenantId = tenantId;
    this.project = project;
    this.name = name;
  }
}
