import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { FiscalTaxRule as DomainFiscalTaxRule } from "@virteex/domain-fiscal-domain";

@Entity({ tableName: 'fiscal_tax_rules' })
export class FiscalTaxRuleRecord extends DomainFiscalTaxRule {
  @PrimaryKey({ type: 'uuid' })
  declare id: string;

  @Property()
  declare tenantId: string;

  @Property()
  declare name: string;

  @Property()
  declare type: string;

  @Property()
  declare rate: string;

  @Property({ nullable: true })
  declare appliesTo?: string;

  @Property()
  declare isActive: boolean;

  @Property()
  declare createdAt: Date;

  @Property()
  declare updatedAt: Date;

  constructor(tenantId: string, name: string, type: string, rate: string, appliesTo?: string) {
    super();
    this.tenantId = tenantId;
    this.name = name;
    this.type = type;
    this.rate = rate;
    this.appliesTo = appliesTo;
  }
}
