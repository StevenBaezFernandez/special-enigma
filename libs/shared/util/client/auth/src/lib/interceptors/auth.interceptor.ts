import { HttpInterceptorFn, HttpErrorResponse, HttpClient, HttpBackend, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { catchError, throwError, BehaviorSubject, switchMap, filter, take, tap } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const httpBackend = inject(HttpBackend);
  const http = new HttpClient(httpBackend);
  const apiUrl = inject(API_URL);

  const token = tokenService.getAccessToken();

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
      if (error.status === 401 && !authReq.url.includes('/auth/login') && !authReq.url.includes('/auth/refresh')) {
         return handle401Error(authReq, next, tokenService, http, router, apiUrl);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
    request: HttpRequest<any>,
    next: HttpHandlerFn,
    tokenService: TokenService,
    http: HttpClient,
    router: Router,
    apiUrl: any
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return http.post<any>(`${apiUrl}/auth/refresh`, {}, { withCredentials: true }).pipe(
      switchMap((res: any) => {
        isRefreshing = false;
        if (res.accessToken) {
            tokenService.setAccessToken(res.accessToken);
            refreshTokenSubject.next(res.accessToken);
            return next(request.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            }));
        }
        return throwError(() => 'No access token in refresh response');
      }),
      catchError((err) => {
        isRefreshing = false;
        tokenService.clearTokens();
        router.navigate(['/auth/login']);
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return next(request.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        }));
      })
    );
  }
}
