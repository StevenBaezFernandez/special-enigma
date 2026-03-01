
export class TenantConfig {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

    tenantId!: string;

    key!: string;

    value!: string;

  constructor(tenantId: string, key: string, value: string) {
    this.tenantId = tenantId;
    this.key = key;
    this.value = value;
  }
}
