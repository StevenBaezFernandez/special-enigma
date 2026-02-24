import { Injectable, Inject } from '@nestjs/common';
import { Project, ProjectRepository, PROJECT_REPOSITORY } from '@virteex/domain-projects-domain';

export class CreateProjectDto {
  tenantId!: string;
  name!: string;
  description?: string;
  startDate!: Date;
}

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository
  ) {}

  async execute(dto: CreateProjectDto): Promise<Project> {
    const project = new Project(dto.tenantId, dto.name, new Date(dto.startDate));
    if (dto.description) project.description = dto.description;
    await this.projectRepository.save(project);
    return project;
  }
}
