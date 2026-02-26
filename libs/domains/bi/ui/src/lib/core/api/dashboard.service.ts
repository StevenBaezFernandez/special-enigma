import { APP_CONFIG } from '@virteex/shared-config';
// app/core/api/dashboard.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuickRatioResponse {
  quickRatio: number;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private config = inject(APP_CONFIG);
  private http = inject(HttpClient);
  private apiUrl = `${this.config.apiUrl}/dashboard`;

  getQuickRatio(): Observable<QuickRatioResponse> {
    return this.http.get<QuickRatioResponse>(`${this.apiUrl}/kpi/quick-ratio`);
  }
}