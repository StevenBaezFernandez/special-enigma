import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

export interface FixedAsset {
  id: string;
  name: string;
  acquisitionDate: Date;
  acquisitionCost: string;
  depreciationRate: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class FixedAssetsService {
  private apiUrl = inject(API_URL);
  private http = inject(HttpClient);

  getAssets(): Observable<FixedAsset[]> {
    return this.http.get<FixedAsset[]>(`${this.apiUrl}/fixed-assets`);
  }
}
