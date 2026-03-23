import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Session, SessionRepository } from '@virteex/domain-identity-domain';

@Injectable()
export class MikroOrmSessionRepository implements SessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly repository: EntityRepository<Session>
  ) {}

  async save(session: Session): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(session);
  }

  async findById(id: string): Promise<Session | null> {
    return this.repository.findOne({ id });
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.repository.find({ user: { id: userId } });
  }

  async delete(id: string): Promise<void> {
      const session = await this.repository.findOne({ id });
      if (session) {
          await this.repository.getEntityManager().removeAndFlush(session);
      }
  }

  async deleteByUserId(userId: string): Promise<void> {
    const sessions = await this.findByUserId(userId);
    for (const session of sessions) {
      this.repository.getEntityManager().remove(session);
    }
    await this.repository.getEntityManager().flush();
  }
}
