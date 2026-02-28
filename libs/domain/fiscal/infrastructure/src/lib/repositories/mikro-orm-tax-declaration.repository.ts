import { Injectable } from '@nestjs/common';
import { TaxDeclarationRepository, TaxDeclaration } from '@virteex/domain-fiscal-domain';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class MikroOrmTaxDeclarationRepository implements TaxDeclarationRepository {
  constructor(
    @InjectRepository(TaxDeclaration)
    private readonly repository: EntityRepository<TaxDeclaration>
  ) {}

  async save(declaration: TaxDeclaration): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(declaration);
  }

  async findAll(): Promise<TaxDeclaration[]> {
    return this.repository.findAll();
  }
}
