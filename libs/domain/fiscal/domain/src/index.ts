import { Injectable } from '@nestjs/common';

@Injectable()
export class FiscalDocumentBuilderFactory {
  getBuilder(country: string): FiscalDocumentBuilder {
    return null as any;
  }

  createBuilder(country: string): FiscalDocumentBuilder {
    return this.getBuilder(country);
  }
}

export const FISCAL_DOCUMENT_BUILDER_FACTORY = Symbol('FISCAL_DOCUMENT_BUILDER_FACTORY');

export interface FiscalDocumentBuilder {
  build(data: any): Promise<any>;
}

export interface TenantFiscalConfig {
  legalName: string;
  taxId: string;
  rfc?: string;
  postalCode?: string;
  regime?: string;
  country?: string;
  brandName?: string;
  address?: string;
  city?: string;
  state?: string;
  certificateNumber?: string;
  csdCertificate?: string;
  csdKey?: string;
  fiscalAddress?: string;
}

import { FiscalInvoiceData } from './lib/entities/fiscal-invoice.entity';

export interface FiscalProvider {
  send(document: any): Promise<any>;
  validateInvoice(invoice: FiscalInvoiceData): Promise<boolean>;
  signInvoice(invoice: FiscalInvoiceData): Promise<string>;
  transmitInvoice(invoice: FiscalInvoiceData): Promise<void>;
}

export interface FiscalStats {
  total: number;
  taxesPayable?: number;
  pendingDeclarations?: number;
  nextDueDate?: Date;
  status?: string;
}

export interface FiscalDataProvider {
  getStats(tenantId: string): Promise<FiscalStats>;
  getFiscalStats(tenantId: string): Promise<FiscalStats>;
}

export interface HardwareTokenPort {
  getInfo(): Promise<any>;
  isAvailable(): Promise<boolean>;
}

export interface HardwareTokenInfo {
  id: string;
}

export const TAX_DECLARATION_REPOSITORY = Symbol('TAX_DECLARATION_REPOSITORY');
export const TAX_RULE_REPOSITORY = Symbol('TAX_RULE_REPOSITORY');
export const TENANT_CONFIG_REPOSITORY = Symbol('TENANT_CONFIG_REPOSITORY');
export const HARDWARE_TOKEN_PORT = Symbol('HARDWARE_TOKEN_PORT');
export const FISCAL_DATA_PROVIDER = Symbol('FISCAL_DATA_PROVIDER');

export class TaxDeclaration {
  id!: string;
  tenantId!: string;
  period!: string;
  amount!: string;
  status!: string;

  constructor(tenantId?: string, period?: string, amount?: string) {
    if (tenantId) this.tenantId = tenantId;
    if (period) this.period = period;
    if (amount) this.amount = amount;
  }
}

export class FiscalTaxRule {
  id!: string;
  tenantId!: string;
  name!: string;
  type!: string;
  rate!: string;
  appliesTo?: string;
  isActive = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(tenantId?: string, name?: string, type?: string, rate?: string, appliesTo?: string) {
    if (tenantId) this.tenantId = tenantId;
    if (name) this.name = name;
    if (type) this.type = type;
    if (rate) this.rate = rate;
    if (appliesTo) this.appliesTo = appliesTo;
  }
}

export interface TaxDeclarationRepository {
  save(declaration: TaxDeclaration): Promise<void>;
}

export interface TaxRuleRepository {
  save(rule: FiscalTaxRule): Promise<void>;
  findByTenant(tenantId: string): Promise<FiscalTaxRule[]>;
}

export interface TenantConfigRepository {
  get(tenantId: string): Promise<TenantFiscalConfig>;
  getFiscalConfig(tenantId: string): Promise<TenantFiscalConfig>;
}

export * from './lib/fiscal-domain.service';
export * from './lib/fiscal-domain.module';
export * from './lib/entities/fiscal-invoice.entity';
