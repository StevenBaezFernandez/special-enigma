import { Injectable, Logger } from '@nestjs/common';
import { GeoIpPort, GeoResult } from '@virteex/domain-identity-domain';
import * as geoip from 'geoip-lite';

@Injectable()
export class GeoIpLiteAdapter implements GeoIpPort {
  private readonly logger = new Logger(GeoIpLiteAdapter.name);

  async lookup(ip: string): Promise<GeoResult | null> {
    try {
      const geo = geoip.lookup(ip);
      if (!geo) {
        return null;
      }
      return {
        country: geo.country,
        region: geo.region,
        city: geo.city,
        timezone: geo.timezone,
      };
    } catch (error) {
      this.logger.error(`GeoIP lookup failed for IP ${ip}`, error);
      return null;
    }
  }
}
