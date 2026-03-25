import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
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
  private toast = inject(ToastService) as any;
  private apiUrl = inject(API_URL) as any;

  analyzeContext(urlCountry: string): Observable<ContextAnalysis> {
    return this.http.post<ContextAnalysis>(`${this.apiUrl}/auth/security/context-check`, { urlCountry }).pipe(
        retry(2),
        catchError((err: HttpErrorResponse) => {
            console.error('Security Warning: Context check failed', err);
            this.toast.showWarning('SECURITY.CONTEXT_CHECK_FAILED');
            // Fail safe: Treat as medium risk/verify
            return of({
                action: 'verify' as const,
                detectedCountry: null,
                targetCountry: urlCountry,
                discrepancyLevel: 'medium' as const
            });
        })
    );
  }
}
