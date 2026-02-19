import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApprovalItem {
  id: number;
  title: string;
  requester: string;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class ApprovalsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/approvals`;

  getPendingApprovals(): Observable<ApprovalItem[]> {
    return this.http.get<ApprovalItem[]>(`${this.apiUrl}/pending`);
  }

  approve(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reject`, {});
  }
}
