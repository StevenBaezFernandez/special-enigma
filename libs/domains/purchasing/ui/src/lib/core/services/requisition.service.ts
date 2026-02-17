import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

export interface Requisition {
  id: string;
  reqNumber: string;
  requester: string;
  department: string;
  date: string;
  total: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
}

export interface CreateRequisitionDto {
  requester: string;
  department: string;
  date: string;
  items: { description: string; quantity: number; unitPrice: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class RequisitionService {
  private http = inject(HttpClient);

  constructor(@Inject(API_URL) private apiUrl: string) {}

  getRequisitions(): Observable<Requisition[]> {
    return this.http.get<Requisition[]>(`${this.apiUrl}/purchasing/requisitions`);
  }

  createRequisition(dto: CreateRequisitionDto): Observable<Requisition> {
    return this.http.post<Requisition>(`${this.apiUrl}/purchasing/requisitions`, dto);
  }
}
