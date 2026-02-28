import { Module } from '@nestjs/common';
import { CreateProjectUseCase } from './use-cases/create-project.use-case';
import { GetProjectsUseCase } from './use-cases/get-projects.use-case';

@Module({
  providers: [CreateProjectUseCase, GetProjectsUseCase],
  exports: [CreateProjectUseCase, GetProjectsUseCase]
})
export class ProjectsApplicationModule {}
