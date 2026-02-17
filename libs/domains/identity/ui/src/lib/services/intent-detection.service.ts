import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, shareReplay, retry } from 'rxjs/operators';
import { ToastService } from '@virteex/shared-ui';
import { API_URL } from '@virteex/shared-config';

export interface ContextSignal {
  source: 'url' | 'ip' | 'browser' | 'cookie';
  value: string;
  confidence: number;
}

export interface ContextAnalysis {
  action: 'proceed' | 'suggest' | 'confirm' | 'verify' | 'require_selection';
  detectedCountry: string | null;
  targetCountry: string;
  discrepancyLevel: 'none' | 'low' | 'medium' | 'high';
}

@Injectable({
  providedIn: 'root'
})
export class IntentDetectionService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private apiUrl = inject(API_URL);
  private ipInfo$: Observable<{ country_code: string | null }>;

  constructor() {
    // Cache the IP info request
    // Call our backend proxy instead of external API directly
    this.ipInfo$ = this.http.get<{ country_code: string | null }>(`${this.apiUrl}/auth/location`).pipe(
        retry(2), // Robustness: Retry failed requests
        catchError((err: HttpErrorResponse) => {
          console.error('Security Warning: Unable to detect location via backend.', err);

          if (err.status === 404) {
             console.error('Backend endpoint /auth/location is missing.');
          }

          // Notify user about the limitation
          this.toast.showWarning('SECURITY.LOCATION_DETECTION_UNAVAILABLE');

          // Return null to indicate failure to detect
          return of({ country_code: null });
        }),
        shareReplay(1)
    );
  }

  analyzeContext(urlCountry: string): Observable<ContextAnalysis> {
    return this.ipInfo$.pipe(
        map(info => {
            const ipCountry = info.country_code; // Can be null
            return this.calculateAnalysis(urlCountry.toUpperCase(), ipCountry ? ipCountry.toUpperCase() : null);
        })
    );
  }

  private calculateAnalysis(urlCountry: string, ipCountry: string | null): ContextAnalysis {
    let discrepancyLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
    let action: ContextAnalysis['action'] = 'proceed';

    if (!ipCountry) {
        // If we can't detect IP country, treat as UNKNOWN risk (medium)
        // Secure by default: Do not just proceed blindly.
        return {
            action: 'verify',
            detectedCountry: null,
            targetCountry: urlCountry,
            discrepancyLevel: 'medium'
        };
    }

    if (ipCountry === urlCountry) {
        return { action: 'proceed', detectedCountry: ipCountry, targetCountry: urlCountry, discrepancyLevel: 'none' };
    }

    if (this.areNeighbors(urlCountry, ipCountry)) {
        discrepancyLevel = 'low';
        action = 'suggest';
    } else if (this.sameRegion(urlCountry, ipCountry)) {
        discrepancyLevel = 'medium';
        action = 'confirm';
    } else {
        discrepancyLevel = 'high';
        action = 'verify';
    }

    return {
        action,
        detectedCountry: ipCountry,
        targetCountry: urlCountry,
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
