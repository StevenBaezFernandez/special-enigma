import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';
import { UserResponseDto, UpdateUserDto, AuditLogDto } from '@virteex/domain-identity-contracts';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL, { optional: true } as any) ? `${inject(API_URL as any)}/users` : '/api/users';

  updateProfile(dto: UpdateUserDto): Observable<UserResponseDto> {
    return this.http.patch<UserResponseDto>(`${this.baseUrl}/profile`, dto);
  }

  getJobTitles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/job-titles`);
  }

  uploadAvatar(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/avatar`, formData);
  }

  getAuditLogs(): Observable<AuditLogDto[]> {
    return this.http.get<AuditLogDto[]>(`${this.baseUrl}/audit-logs`);
  }
}
