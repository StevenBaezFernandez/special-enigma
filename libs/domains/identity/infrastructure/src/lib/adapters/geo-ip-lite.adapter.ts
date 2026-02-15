import { Injectable } from '@nestjs/common';
import { GeoIpPort, GeoResult } from '@virteex/identity-domain';
import * as geoip from 'geoip-lite';

@Injectable()
export class GeoIpLiteAdapter implements GeoIpPort {
  async lookup(ip: string): Promise<GeoResult | null> {
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
  }
}
