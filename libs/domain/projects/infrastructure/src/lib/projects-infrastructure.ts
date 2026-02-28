import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Project, Task, PROJECT_REPOSITORY } from '@virteex/domain-projects-domain';
import { MikroOrmProjectRepository } from './repositories/mikro-orm-project.repository';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([Project, Task])
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
