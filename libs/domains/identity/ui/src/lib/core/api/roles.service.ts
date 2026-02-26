import { APP_CONFIG } from '@virteex/shared-config';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

//

// Interfaces que coinciden con los DTOs del Backend
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
}

export type UpdateRoleDto = Partial<CreateRoleDto>;

@Injectable({ providedIn: 'root' })
export class RolesService {
  private config = inject(APP_CONFIG);
  private http = inject(HttpClient);
  private apiUrl = `${this.config.apiUrl}/roles`;

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getAvailablePermissions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/available-permissions`);
  }

  createRole(role: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  updateRole(id: string, role: UpdateRoleDto): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/${id}`, role);
  }

  cloneRole(id: string): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/clone/${id}`, {});
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}