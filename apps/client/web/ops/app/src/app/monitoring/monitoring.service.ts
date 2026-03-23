import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/config/api-base-url.token';

export interface ServiceHealth {
  name: string;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  latency: number;
  version: string;
}

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getSystemHealth(): Observable<ServiceHealth[]> {
    return this.http.get<ServiceHealth[]>(`${this.apiBaseUrl}/admin/monitoring/health`);
  }
}
