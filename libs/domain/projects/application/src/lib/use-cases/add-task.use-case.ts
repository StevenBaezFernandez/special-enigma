import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProjectRepository, PROJECT_REPOSITORY } from '@virteex/domain-projects-domain';
import { Task } from '@virteex/domain-projects-domain';

@Injectable()
export class AddTaskUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository
  ) {}

  async execute(tenantId: string, projectId: string, taskName: string, assignedToId?: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    if (project.tenantId !== tenantId) {
       throw new NotFoundException(`Project ${projectId} not found`);
    }

    if (project.status === 'COMPLETED' || project.status === 'CANCELLED') {
      throw new BadRequestException('Cannot add tasks to a completed or cancelled project');
    }

    // Task constructor needs checking if it accepts project as 2nd arg
    const task = new Task(tenantId, project, taskName);
    if (assignedToId) {
      task.assignedToId = assignedToId;
    }

    project.tasks.add(task);

    await this.projectRepository.save(project);
  }
}
