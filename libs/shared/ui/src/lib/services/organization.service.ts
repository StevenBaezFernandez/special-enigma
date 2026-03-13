
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@virteex/shared-config';

export interface OrganizationProfile {
  id: string;
  legalName: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  website?: string;
  industry?: string;
  logoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private config = inject(APP_CONFIG) as any;
  private apiUrl = `${this.config.apiUrl}/organizations`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<OrganizationProfile> {
    return this.http.get<OrganizationProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<OrganizationProfile>): Observable<OrganizationProfile> {
    return this.http.patch<OrganizationProfile>(`${this.apiUrl}/profile`, data);
  }
}
