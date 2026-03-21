import { InjectionToken } from '@angular/core';

export interface AppConfig {
  production: boolean;
  apiUrl: string;
  recaptcha?: {
    siteKey: string;
  };
  vapidPublicKey?: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

/**
 * Resolves the BFF URL based on the provided channel name.
 * This helper avoids hardcoding /api everywhere and facilitates the migration
 * from a single gateway to multiple BFFs.
 */
export function getBffUrl(channel: string, baseApiUrl: string): string {
  // If the baseApiUrl already contains a specific BFF path, return it
  if (baseApiUrl.includes(`/${channel}`)) {
    return baseApiUrl;
  }

  // Mapping of channels to their respective BFF subpaths
  const bffMap: Record<string, string> = {
    portal: 'portal',
    pos: 'pos',
    wms: 'wms',
    shopfloor: 'shopfloor',
    support: 'support',
    cms: 'cms',
    site: 'site',
    storefront: 'storefront'
  };

  const subpath = bffMap[channel] || channel;

  // Ensure we don't end up with double slashes
  const normalizedBase = baseApiUrl.endsWith('/') ? baseApiUrl.slice(0, -1) : baseApiUrl;

  // If the base URL is the root (e.g. api.virteex.com), append the subpath
  // In the new architecture: api.virteex.com/portal, api.virteex.com/pos, etc.
  return `${normalizedBase}/${subpath}`;
}
