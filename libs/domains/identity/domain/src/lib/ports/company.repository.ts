import { Company } from '../entities/company.entity';

export abstract class CompanyRepository {
  abstract save(company: Company): Promise<void>;
  abstract findById(id: string): Promise<Company | null>;
  abstract findByTaxId(taxId: string): Promise<Company | null>;
  abstract existsByTaxId(taxId: string): Promise<boolean>;
  abstract findAll(options?: any): Promise<Company[]>;
}
