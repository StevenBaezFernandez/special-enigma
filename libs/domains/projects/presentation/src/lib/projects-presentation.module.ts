import { Module } from '@nestjs/common';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsApplicationModule } from '@virteex/application-projects-application';
import { ProjectsInfrastructureModule } from '@virteex/infra-projects-infrastructure';

@Module({
  imports: [ProjectsApplicationModule, ProjectsInfrastructureModule],
  controllers: [ProjectsController],
})
export class ProjectsPresentationModule {}
