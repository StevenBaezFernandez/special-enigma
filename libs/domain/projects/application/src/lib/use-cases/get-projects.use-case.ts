import { Injectable, Inject } from '@nestjs/common';
import { Project, ProjectRepository, PROJECT_REPOSITORY } from '@virteex/domain-projects-domain';

@Injectable()
export class GetProjectsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository
  ) {}

  async execute(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }
}
