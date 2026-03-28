import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DashboardGateway, DashboardMetrics } from '@virteex/domain-admin-domain';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpDashboardGateway implements DashboardGateway {
  private readonly logger = new Logger(HttpDashboardGateway.name);
  private readonly billingUrl: string;
  private readonly identityUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.billingUrl = this.configService.get<string>('BILLING_SERVICE_URL', 'http://virteex-billing-service:3000');
    this.identityUrl = this.configService.get<string>('IDENTITY_SERVICE_URL', 'http://virteex-identity-service:3000');
  }

  async getMetrics(): Promise<DashboardMetrics> {
    try {
      // Parallel requests for metrics
      const [mrrResponse, tenantsResponse] = await Promise.all([
        firstValueFrom(this.httpService.get(`${this.billingUrl}/billing/metrics/mrr`)),
        firstValueFrom(this.httpService.get(`${this.identityUrl}/identity/metrics/tenants`))
      ]);

      const mrr = mrrResponse.data?.totalMrr || 0;
      const activeTenants = tenantsResponse.data?.activeCount || 0;

      // Churn calculation would ideally come from billing or identity history
      const churnRate = mrrResponse.data?.churnRate || 0;

      return {
        mrr,
        totalTenants: activeTenants, // Approximate for this adapter
        activeTenants,
        suspendedTenants: 0,
        provisioningTenants: 0,
        churnRate,
        recentActivity: []
      };
    } catch (error  : any) {
      this.logger.error(`Failed to fetch dashboard metrics: ${error.message}`, error.stack);
      // Fallback or rethrow depending on resilience requirements
      // For now, return zeros to avoid crashing the dashboard entirely
      return {
        mrr: 0,
        totalTenants: 0,
        activeTenants: 0,
        suspendedTenants: 0,
        provisioningTenants: 0,
        churnRate: 0,
        recentActivity: []
      };
    }
  }
}
