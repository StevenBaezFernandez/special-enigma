import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountryGuard implements CanActivate {
  private router = inject(Router);
  private http = inject(HttpClient);

  canActivate(): Observable<boolean | UrlTree> {
    // Ideally this checks against user's tenant allowed countries or IP location via API.
    // For now, call backend /auth/location or similar if exists, or check localStorage

    // Simulating check: if not allowed country, redirect to block page.
    // Assuming backend endpoint /api/auth/check-location exists (from IntentDetectionService context)
    return this.http.get<{ allowed: boolean }>('/api/auth/check-location').pipe(
        map(response => {
            if (response.allowed) return true;
            return this.router.createUrlTree(['/not-allowed-country']);
        }),
        catchError(() => {
            // If check fails, block access for security
            return of(this.router.createUrlTree(['/error']));
        })
    );
  }
}
