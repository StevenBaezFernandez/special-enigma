export class TenantConsent {
  id!: string;
  tenantId!: string;
  purpose!: string;
  status!: string;
  grantedAt!: Date;
  expiresAt?: Date;
}
