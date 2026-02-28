import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SyncService } from './sync.service';

export interface ApprovalItem {
  id: number;
  title: string;
  requester: string;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class ApprovalsService {
  private http = inject(HttpClient);
  private sync = inject(SyncService);
  private apiUrl = `${environment.apiUrl}/approvals`;

  getPendingApprovals(): Observable<ApprovalItem[]> {
    return this.http.get<ApprovalItem[]>(`${this.apiUrl}/pending`);
  }

  approve(id: number): Observable<any> {
    return from(this.sync.request('POST', `${this.apiUrl}/${id}/approve`, {}));
  }

  reject(id: number): Observable<any> {
    return from(this.sync.request('POST', `${this.apiUrl}/${id}/reject`, {}));
  }
}
