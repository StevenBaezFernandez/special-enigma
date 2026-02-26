import { Injectable, inject, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '@virteex/shared-config';

export interface GraphQLResponse<T> {
  data: T;
  errors?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class GraphQLClientService {
  private http = inject(HttpClient);

  constructor(@Inject(API_URL) private apiUrl: string) {}

  query<T>(query: string, variables?: Record<string, any>): Observable<T> {
    return this.http.post<GraphQLResponse<T>>(`${this.apiUrl}/graphql`, {
      query,
      variables
    }).pipe(
      map(response => {
        if (response.errors) {
          throw new Error(response.errors[0].message);
        }
        return response.data;
      })
    );
  }

  mutate<T>(mutation: string, variables?: Record<string, any>): Observable<T> {
    return this.query<T>(mutation, variables);
  }
}
