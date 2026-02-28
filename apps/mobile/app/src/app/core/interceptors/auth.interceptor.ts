import { HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpErrorResponse, HttpClient, HttpBackend } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, catchError, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { SecureStorageService } from '@virteex/shared-util-auth';
import { Router } from '@angular/router';
import { API_URL } from '@virteex/shared-config';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const secureStorage = inject(SecureStorageService);
  const router = inject(Router);
  const httpBackend = inject(HttpBackend);
  const http = new HttpClient(httpBackend);
  const apiUrl = inject(API_URL);

  return from(secureStorage.get('access_token')).pipe(
    switchMap(token => {
      let authReq = req;
      if (token) {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 && !authReq.url.includes('/auth/login')) {
            return handle401Error(authReq, next, secureStorage, http, router, apiUrl);
          }
          return throwError(() => error);
        })
      );
    })
  );
};

function handle401Error(
    request: HttpRequest<any>,
    next: HttpHandlerFn,
    secureStorage: SecureStorageService,
    http: HttpClient,
    router: Router,
    apiUrl: string
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return from(secureStorage.get('refresh_token')).pipe(
        switchMap(refreshToken => {
            if (!refreshToken) {
                isRefreshing = false;
                secureStorage.clear();
                router.navigate(['/auth/login']);
                return throwError(() => 'No refresh token');
            }

            return http.post<any>(`${apiUrl}/auth/refresh`, { refreshToken }).pipe(
                switchMap(async (res: any) => {
                    isRefreshing = false;
                    if (res.accessToken) {
                        await secureStorage.set('access_token', res.accessToken);
                        refreshTokenSubject.next(res.accessToken);
                    }
                    if (res.refreshToken) {
                        await secureStorage.set('refresh_token', res.refreshToken);
                    }
                    return res.accessToken;
                }),
                switchMap((newToken) => {
                     return next(request.clone({
                         setHeaders: { Authorization: `Bearer ${newToken}` }
                     }));
                }),
                catchError((err) => {
                    isRefreshing = false;
                    secureStorage.clear();
                    router.navigate(['/auth/login']);
                    return throwError(() => err);
                })
            );
        })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        return next(request.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        }));
      })
    );
  }
}
