import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { TaxDeclaration as DomainTaxDeclaration } from "@virteex/domain-fiscal-domain";

@Entity({ tableName: 'tax_declarations' })
export class TaxDeclarationRecord extends DomainTaxDeclaration {
  @PrimaryKey({ type: 'uuid' })
  declare id: string;

  @Property()
  declare tenantId: string;

  @Property()
  declare period: string;

  @Property()
  declare amount: string;

  @Property()
  declare status: string;

  constructor(tenantId: string, period: string, amount: string) {
    super();
    this.tenantId = tenantId;
    this.period = period;
    this.amount = amount;
  }
}
