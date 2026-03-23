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

  // Cookie-first strategy: We don't manually add the Authorization header
  // unless we specifically have an access token and want to use it (e.g., for M2M).
  // For the web portal, we rely on HttpOnly cookies.
  const token = tokenService.getAccessToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Ensure withCredentials is true for all API requests to send cookies
  if (req.url.includes(apiUrl)) {
    authReq = authReq.clone({ withCredentials: true });
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
        // The backend now only returns expiresIn and sets cookies.
        // If we get a 200 OK, the refresh was successful.
        // If we are using an access token in memory, we might still want it,
        // but if we are cookie-first, we just retry the request.

        if (res.accessToken) {
            tokenService.setAccessToken(res.accessToken);
            refreshTokenSubject.next(res.accessToken);
        } else {
            // For cookie-only, we can use a dummy value to signal success to the subject
            refreshTokenSubject.next('cookie-refreshed');
        }

        let nextReq = request.clone({ withCredentials: true });
        if (res.accessToken) {
            nextReq = nextReq.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            });
        }

        return next(nextReq);
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
