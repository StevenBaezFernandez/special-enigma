import { Injectable } from '@nestjs/common';

export interface ContextAnalysis {
  action: 'proceed' | 'suggest' | 'confirm' | 'verify' | 'require_selection';
  detectedCountry: string | null;
  targetCountry: string;
  discrepancyLevel: 'none' | 'low' | 'medium' | 'high';
}

@Injectable()
export class RiskEvaluatorService {
  analyzeContext(urlCountry: string, ipCountry: string | null): ContextAnalysis {
    let discrepancyLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
    let action: ContextAnalysis['action'] = 'proceed';

    if (!ipCountry) {
        return {
            action: 'verify',
            detectedCountry: null,
            targetCountry: urlCountry,
            discrepancyLevel: 'medium'
        };
    }

    // Normalize
    const normalizedIp = ipCountry.toUpperCase();
    const normalizedUrl = urlCountry.toUpperCase();

    if (normalizedIp === normalizedUrl) {
        return { action: 'proceed', detectedCountry: normalizedIp, targetCountry: normalizedUrl, discrepancyLevel: 'none' };
    }

    if (this.areNeighbors(normalizedUrl, normalizedIp)) {
        discrepancyLevel = 'low';
        action = 'suggest';
    } else if (this.sameRegion(normalizedUrl, normalizedIp)) {
        discrepancyLevel = 'medium';
        action = 'confirm';
    } else {
        discrepancyLevel = 'high';
        action = 'verify';
    }

    return {
        action,
        detectedCountry: normalizedIp,
        targetCountry: normalizedUrl,
        discrepancyLevel
    };
  }

  private areNeighbors(c1: string, c2: string): boolean {
      const neighbors: Record<string, string[]> = {
          'CO': ['VE', 'EC', 'PE', 'BR', 'PA'],
          'VE': ['CO', 'BR', 'GY'],
          'EC': ['CO', 'PE'],
          'PE': ['EC', 'CO', 'BR', 'BO', 'CL'],
          'BR': ['CO', 'VE', 'GY', 'SR', 'GF', 'PE', 'BO', 'PY', 'AR', 'UY'],
          'PA': ['CO', 'CR'],
          'MX': ['US', 'GT', 'BZ'],
          'US': ['CA', 'MX'],
          'CA': ['US'],
          'AR': ['CL', 'BO', 'PY', 'BR', 'UY'],
          'CL': ['PE', 'BO', 'AR'],
      };
      return (neighbors[c1]?.includes(c2)) || (neighbors[c2]?.includes(c1)) || false;
  }

  private sameRegion(c1: string, c2: string): boolean {
      const latam = ['CO', 'MX', 'BR', 'AR', 'PE', 'CL', 'EC', 'VE', 'UY', 'PY', 'BO', 'GT', 'CR', 'PA', 'DO'];
      const northAm = ['US', 'CA', 'MX'];
      const europe = ['ES', 'FR', 'DE', 'IT', 'UK', 'PT'];

      const inRegion = (region: string[]) => region.includes(c1) && region.includes(c2);

      if (inRegion(latam)) return true;
      if (inRegion(northAm)) return true;
      if (inRegion(europe)) return true;

      return false;
  }
}
