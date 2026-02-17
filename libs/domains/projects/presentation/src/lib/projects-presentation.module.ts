import { Module } from '@nestjs/common';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsApplicationModule } from '@virteex/projects-application';
import { ProjectsInfrastructureModule } from '@virteex/projects-infrastructure';

@Module({
  imports: [ProjectsApplicationModule, ProjectsInfrastructureModule],
  controllers: [ProjectsController],
})
export class ProjectsPresentationModule {}
