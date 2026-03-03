
import { ProjectStatus } from '@virteex/shared-contracts';
import type { Task } from './task.entity';


export class Project {

  id!: string;


    tenantId!: string;


    name!: string;


    description?: string;


    startDate!: Date;


    endDate?: Date;



  status: ProjectStatus = ProjectStatus.PLANNED;


  tasks = new Collection<Task>(this);


    createdAt: Date = new Date();


    updatedAt: Date = new Date();

  constructor(tenantId: string, name: string, startDate: Date) {
    this.tenantId = tenantId;
    this.name = name;
    this.startDate = startDate;
  }
}
