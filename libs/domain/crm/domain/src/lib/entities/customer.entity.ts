import { CustomerType } from '@virteex/shared-contracts';
import { v4 as uuidv4 } from 'uuid';
import type { Opportunity } from './opportunity.entity';

export class Customer {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

    tenantId!: string;

  @Enum(() => CustomerType)
  type: CustomerType = CustomerType.COMPANY;

    firstName?: string;

    lastName?: string;

    companyName?: string;

    email?: string;

    phone?: string;

    taxId?: string;

    taxRegimen?: string;

    contactPerson?: string;

    address?: string;

    city?: string;

    stateOrProvince?: string;

    postalCode?: string;

    country?: string;

  @OneToMany('Opportunity', 'customer', { cascade: [Cascade.ALL] })
  opportunities = new Collection<Opportunity>(this);

    createdAt: Date = new Date();

    updatedAt: Date = new Date();

  constructor(tenantId: string, type: CustomerType) {
    this.tenantId = tenantId;
    this.type = type;
  }

  @BeforeCreate()
  @BeforeUpdate()
  validateTaxId() {
      if (!this.taxId || !this.country) return;

      const country = this.country.toUpperCase();
      const taxId = this.taxId.toUpperCase();

      if (country === 'MX' || country === 'MEXICO') {
          // RFC Validation
          // Regex for Person (4 chars) and Company (3 chars)
          const rfcPattern = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A-Z\d])$/;
          if (!rfcPattern.test(taxId)) {
              throw new ValidationError(`Invalid RFC format for Mexico: ${this.taxId}`);
          }
      } else if (country === 'US' || country === 'USA') {
          // EIN Validation (XX-XXXXXXX) or SSN (XXX-XX-XXXX) or simple 9 digits
          // Remove separators for check
          const cleanTaxId = taxId.replace(/[^0-9]/g, '');
          if (cleanTaxId.length !== 9) {
               throw new ValidationError(`Invalid Tax ID (EIN/SSN) format for US: ${this.taxId}. Must be 9 digits.`);
          }
      }
      else if (country === 'BR' || country === 'BRAZIL') {
          // CNPJ (14) or CPF (11)
          const cleanTaxId = taxId.replace(/[^0-9]/g, '');
          if (cleanTaxId.length !== 11 && cleanTaxId.length !== 14) {
               throw new ValidationError(`Invalid Tax ID (CPF/CNPJ) format for Brazil: ${this.taxId}`);
          }
      }
  }
}
