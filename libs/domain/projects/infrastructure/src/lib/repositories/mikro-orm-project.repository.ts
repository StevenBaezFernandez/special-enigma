import { Injectable } from '@nestjs/common';
import { ProjectRepository, Project } from '@virteex/domain-projects-domain';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class MikroOrmProjectRepository implements ProjectRepository {
  constructor(
    @InjectRepository(Project)
    private readonly repository: EntityRepository<Project>
  ) {}

  async save(project: Project): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(project);
  }

  async findById(id: string): Promise<Project | null> {
    return this.repository.findOne({ id }, { populate: ['tasks'] });
  }

  async findAll(): Promise<Project[]> {
    return this.repository.findAll({ populate: ['tasks'] });
  }

  async findByMember(userId: string): Promise<Project[]> {
    // Assuming 'members' is a collection or array of IDs, or related entity
    // If members is a ManyToMany with User, we query by relation.
    // Assuming simplistic implementation based on typical MikroORM patterns for now
    // If 'members' stores user IDs:
    return this.repository.find({
        $or: [
            { managerId: userId },
            // { members: { $in: [userId] } } // Depends on entity definition, assuming managerId exists or similar
        ]
    } as any, { populate: ['tasks'] });
  }
}
