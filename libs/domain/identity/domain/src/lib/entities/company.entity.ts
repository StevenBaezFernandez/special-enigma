import { v4 as uuidv4 } from 'uuid';
import type { User } from './user.entity';

export class Company {
  id: string = uuidv4();
  name!: string;
  taxId!: string; // NIT, RFC, etc.
  country!: string;
  regime?: string; // Simplified, Ordinary, Gran Contribuyente
  postalCode?: string;
  currency = 'USD'; // Default, adaptive based on country
  settings?: Record<string, any>; // For tax configurations
  metadata?: Record<string, any>;
  users: User[] = [];
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(name: string, taxId: string, country: string) {
    this.name = name;
    this.taxId = taxId;
    this.country = country;
    this.currency = this.getDefaultCurrency(country);
  }

  private getDefaultCurrency(country: string): string {
      switch(country) {
          case 'CO': return 'COP';
          case 'MX': return 'MXN';
          case 'BR': return 'BRL';
          case 'US': return 'USD';
          default: return 'USD';
      }
  }
}
