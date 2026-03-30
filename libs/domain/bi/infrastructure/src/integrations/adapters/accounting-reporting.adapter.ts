import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { IAccountingReportingPort } from '@virteex/domain-accounting-contracts';
import { SecretManagerService } from '@virteex/kernel-auth';
import { buildSignedContextClaims, encodeContextClaims, signEncodedContext } from '@virteex/kernel-auth';

@Injectable()
export class AccountingReportingAdapter implements IAccountingReportingPort, OnModuleInit {
  private hmacSecret!: string;

  constructor(
    private readonly secretManager: SecretManagerService
  ) {}

  onModuleInit() {
    this.hmacSecret = this.secretManager.getSecret('VIRTEEX_HMAC_SECRET');
  }

  async countJournalEntries(tenantId: string): Promise<number> {
    const baseUrl = process.env['ACCOUNTING_SERVICE_URL'] || 'http://accounting-service:3000';

    const claims = buildSignedContextClaims({
      tenantId,
      userId: 'system-bi',
      provenance: 'bi-service'
    });
    const encodedContext = encodeContextClaims(claims);
    const signature = signEncodedContext(encodedContext, this.hmacSecret);

    try {
      const response = await fetch(`${baseUrl}/api/accounting/journal-entries/count`, {
          headers: {
            'x-virteex-tenant-id': tenantId,
            'x-virteex-context': encodedContext,
            'x-virteex-signature': signature
          }
      });
      if (!response.ok) return 0;
      const data = await response.json();
      return data.count;
    } catch (error) {
      return 0;
    }
  }
}
