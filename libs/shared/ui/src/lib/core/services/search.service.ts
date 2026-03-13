import { APP_CONFIG } from '@virteex/shared-config';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  link: string;
}

export interface SearchResultGroup {
  type: 'Invoices' | 'Products' | 'Customers';
  results: SearchResult[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private config = inject(APP_CONFIG) as any;
  private http = inject(HttpClient);
  private apiUrl = `${this.config.apiUrl}/search`;

  search(query: string): Observable<SearchResultGroup[]> {
    return this.http.get<SearchResultGroup[]>(this.apiUrl, { params: { q: query } });
  }
}
