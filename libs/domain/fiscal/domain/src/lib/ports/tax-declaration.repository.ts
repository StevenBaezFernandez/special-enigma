import { TaxDeclaration } from '../entities/tax-declaration.entity';

export const TAX_DECLARATION_REPOSITORY = 'TAX_DECLARATION_REPOSITORY';

export interface TaxDeclarationRepository {
  save(declaration: TaxDeclaration): Promise<void>;
  findAll(): Promise<TaxDeclaration[]>;
}
