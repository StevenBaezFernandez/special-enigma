import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PROJECT_REPOSITORY } from '@virteex/domain-projects-domain';
import { MikroOrmProjectRepository } from './repositories/mikro-orm-project.repository';
import { ProjectSchema, TaskSchema } from './persistence/projects.schemas';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([ProjectSchema, TaskSchema])
  ],
  providers: [
    {
      provide: PROJECT_REPOSITORY,
      useClass: MikroOrmProjectRepository
    }
  ],
  exports: [
    MikroOrmModule,
    PROJECT_REPOSITORY
  ]
})
export class ProjectsInfrastructureModule {}
