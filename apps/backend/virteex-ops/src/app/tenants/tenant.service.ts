import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  id: string;
  name: string;
  taxId: string;
  country: string;
  createdAt?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = 'http://localhost:3000/api/admin/tenants';
  private http = inject(HttpClient);

  getTenants(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  getTenant(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`);
  }
}
