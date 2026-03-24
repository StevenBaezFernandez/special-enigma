import { APP_CONFIG } from '@virteex/shared-config';
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, catchError, Observable, timer, switchMap, filter } from 'rxjs';

import { Router, NavigationStart } from '@angular/router';

export interface GeoLocationResponse {
  country: string | null;
  ip: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeoLocationService {
  private config = inject(APP_CONFIG) as any;
  private http = inject(HttpClient);
  private router = inject(Router);

  mismatchSignal = signal<{ detected: string, current: string } | null>(null);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.mismatchSignal.set(null);
    });
  }

  getGeoLocation(): Observable<GeoLocationResponse> {
    return this.http.get<GeoLocationResponse>(`${this.config.apiUrl}/auth/location`).pipe(
        catchError(() => {
            return of({ country: null, ip: '' });
        })
    );
  }

  checkAndNotifyMismatch(routeCountryCode: string) {
    if (!routeCountryCode) return;

    timer(2000).pipe(
        switchMap(() => this.getGeoLocation())
    ).subscribe(response => {
      const currentUrl = this.router.url.toLowerCase();
      const targetSegment = `/${routeCountryCode.toLowerCase()}/`;

      if (!currentUrl.includes(targetSegment)) {
        return;
      }

      const detected = response.country;

      if (detected && routeCountryCode.toLowerCase() !== detected.toLowerCase()) {
        this.mismatchSignal.set({
            detected: detected.toUpperCase(),
            current: routeCountryCode.toUpperCase()
        });
      } else {
        this.mismatchSignal.set(null);
      }
    });
  }
}