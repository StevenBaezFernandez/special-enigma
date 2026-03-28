import { CustomerType } from '@virteex/shared-contracts';
import { v4 as uuidv4 } from 'uuid';

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
  opportunities  : any[] = [];
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
    } else if (country === 'DO' || country === 'DOMINICAN REPUBLIC' || country === 'REPUBLICA DOMINICANA') {
      const cleanTaxId = this.taxId.replace(/[^0-9]/g, '');
      if (cleanTaxId.length === 9) {
        if (!this.validateRNC(cleanTaxId)) {
          throw new Error(`Invalid RNC for Dominican Republic: ${this.taxId}`);
        }
      } else if (cleanTaxId.length === 11) {
        if (!this.validateCedula(cleanTaxId)) {
          throw new Error(`Invalid Cédula for Dominican Republic: ${this.taxId}`);
        }
      } else {
        throw new Error(`Invalid Tax ID format for Dominican Republic: ${this.taxId}. Must be 9 (RNC) or 11 (Cédula) digits.`);
      }
    }
  }

  private validateRNC(rnc: string): boolean {
    const rncArray = rnc.split('').map(Number);
    const peso = [7, 9, 8, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 8; i++) {
      suma += rncArray[i] * peso[i];
    }
    const resto = suma % 11;
    let digitoVerificador: number;
    if (resto === 0) {
      digitoVerificador = 2;
    } else if (resto === 1) {
      digitoVerificador = 1;
    } else {
      digitoVerificador = 11 - resto;
    }
    return digitoVerificador === rncArray[8];
  }

  private validateCedula(cedula: string): boolean {
    const cedulaArray = cedula.split('').map(Number);
    let suma = 0;
    const peso = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
    for (let i = 0; i < 10; i++) {
      let calculo = cedulaArray[i] * peso[i];
      if (calculo >= 10) {
        calculo = Math.floor(calculo / 10) + (calculo % 10);
      }
      suma += calculo;
    }
    const resto = suma % 10;
    const verificador = (resto === 0) ? 0 : 10 - resto;
    return verificador === cedulaArray[10];
  }
}
