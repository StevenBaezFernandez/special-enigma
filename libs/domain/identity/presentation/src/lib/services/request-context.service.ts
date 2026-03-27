import { Injectable, Inject, Optional } from '@nestjs/common';
import { Request } from 'express';
import { GeoIpPort, GEO_IP_PORT } from '@virteex/domain-identity-domain';
import { SecretManagerService } from '@virteex/kernel-auth';

@Injectable()
export class RequestContextService {
  constructor(
    @Inject(GEO_IP_PORT) private readonly geoIpPort: GeoIpPort,
    @Optional() private readonly secretManager?: SecretManagerService
  ) {}

  extractIp(req: Request): string {
    let ip: string = req.ip || '127.0.0.1';
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        if (Array.isArray(forwarded)) {
            ip = forwarded[0];
        } else {
            ip = forwarded.split(',')[0].trim();
        }
    }
    return ip;
  }

  async getGeoLocation(ip: string): Promise<any> {
    const geo = await this.geoIpPort.lookup(ip);
    if (!geo) {
        const isProd = this.secretManager?.getSecret('NODE_ENV', 'development') === 'production' || process.env['NODE_ENV'] === 'production';
        if (!isProd) {
            return {
                country: 'MX',
                country_code: 'MX',
                city: 'Development City',
                region: 'DEV',
                timezone: 'America/Mexico_City',
                ip
            };
        }
        return { country: null, country_code: null, city: 'Unknown', ip };
    }

    return {
        country: geo.country,
        country_code: geo.country,
        city: geo.city,
        region: geo.region,
        timezone: geo.timezone,
        ip
    };
  }
}
