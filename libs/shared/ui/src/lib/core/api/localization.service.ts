import { APP_CONFIG } from '@virteex/shared-config';
// ../app/core/api/localization.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FiscalRegion } from '../models/fiscal-region.model';

@Injectable({
  providedIn: 'root',
})
export class LocalizationApiService {
  private config = inject(APP_CONFIG) as any as any;
  private http = inject(HttpClient);
  private apiUrl = `${this.config.apiUrl}/localization`;

  getFiscalRegions(): Observable<FiscalRegion[]> {
    return this.http.get<FiscalRegion[]>(`${this.apiUrl}/fiscal-regions`);
  }
}
