import { Project } from '../entities/project.entity';

export const PROJECT_REPOSITORY = 'PROJECT_REPOSITORY';

export interface ProjectRepository {
  save(project: Project): Promise<void>;
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  findByMember(userId: string): Promise<Project[]>;
}
