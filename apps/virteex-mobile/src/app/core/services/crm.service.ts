import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Deal {
  id: number;
  name: string;
  company: string;
  stage: string;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class CrmService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/crm`;

  getDeals(): Observable<Deal[]> {
    return this.http.get<Deal[]>(`${this.apiUrl}/deals`);
  }
}
