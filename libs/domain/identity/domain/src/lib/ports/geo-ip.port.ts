export interface GeoResult {
  country: string;
  region: string;
  city: string;
  timezone: string;
}

export interface GeoIpPort {
  lookup(ip: string): Promise<GeoResult | null>;
}

export const GEO_IP_PORT = 'GEO_IP_PORT';
