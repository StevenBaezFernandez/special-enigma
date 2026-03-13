import { Injectable } from '@nestjs/common';

@Injectable()
export class FiscalDocumentBuilderFactory {
  createBuilder(country: string) {
    return null;
  }
}

export const FISCAL_DOCUMENT_BUILDER_FACTORY = Symbol('FISCAL_DOCUMENT_BUILDER_FACTORY');

export interface FiscalDocumentBuilder {
  build(data: any): Promise<any>;
}

export interface TenantFiscalConfig {
  legalName: string;
  taxId: string;
}

export interface FiscalProvider {
  send(document: any): Promise<any>;
}

export interface FiscalStats {
  total: number;
}

export interface FiscalDataProvider {
  getStats(tenantId: string): Promise<FiscalStats>;
}

export interface HardwareTokenPort {
  getInfo(): Promise<any>;
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
}

export interface TaxDeclarationRepository {
  save(declaration: TaxDeclaration): Promise<void>;
}

export interface TaxRuleRepository {
  save(rule: FiscalTaxRule): Promise<void>;
}

export interface TenantConfigRepository {
  get(tenantId: string): Promise<TenantFiscalConfig>;
}

export * from './lib/fiscal-domain.service';
export * from './lib/fiscal-domain.module';
