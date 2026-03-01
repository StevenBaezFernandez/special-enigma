import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EgressProxyService {
  private readonly logger = new Logger(EgressProxyService.name);
  private readonly allowedHosts: Set<string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    const hosts = this.configService.get<string>('ALLOWED_EGRESS_HOSTS', 'api.dian.gov.co,nfe.fazenda.sp.gov.br,api.taxjar.com');
    this.allowedHosts = new Set(hosts.split(',').map(h => h.trim()));
  }

  async safeRequest(url: string, method: string, data?: any, headers?: any): Promise<any> {
    const host = new URL(url).hostname;

    if (!this.allowedHosts.has(host)) {
      this.logger.error(`Exfiltration attempt blocked: ${host} is not in allowlist`);
      throw new ForbiddenException(`Egress to ${host} is denied by policy.`);
    }

    this.logger.log(`Egress authorized: ${method} ${url}`);

    const response = await firstValueFrom(
      this.httpService.request({
        url,
        method,
        data,
        headers: {
          ...headers,
          'X-Virteex-Proxy': 'true'
        }
      })
    );

    return response.data;
  }
}
