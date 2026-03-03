import { CustomerType } from '@virteex/shared-contracts';
import { v4 as uuidv4 } from 'uuid';
import type { Opportunity } from './opportunity.entity';

export class Customer {
  id: string = uuidv4();
  tenantId!: string;
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
  opportunities: any[] = [];
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(tenantId: string, type: CustomerType) {
    this.tenantId = tenantId;
    this.type = type;
  }

  validateTaxId() {
    if (!this.taxId || !this.country) return;

    const country = this.country.toUpperCase();
    const taxId = this.taxId.toUpperCase();

    if (country === 'MX' || country === 'MEXICO') {
      const rfcPattern =
        /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A-Z\d])$/;
      if (!rfcPattern.test(taxId)) {
        throw new Error(`Invalid RFC format for Mexico: ${this.taxId}`);
      }
    } else if (country === 'US' || country === 'USA') {
      const cleanTaxId = taxId.replace(/[^0-9]/g, '');
      if (cleanTaxId.length !== 9) {
        throw new Error(`Invalid Tax ID (EIN/SSN) format for US: ${this.taxId}. Must be 9 digits.`);
      }
    } else if (country === 'BR' || country === 'BRAZIL') {
      const cleanTaxId = taxId.replace(/[^0-9]/g, '');
      if (cleanTaxId.length !== 11 && cleanTaxId.length !== 14) {
        throw new Error(`Invalid Tax ID (CPF/CNPJ) format for Brazil: ${this.taxId}`);
      }
    }
  }
}
