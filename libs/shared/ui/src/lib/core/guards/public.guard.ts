import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';
import { LanguageService } from '../services/language';
import { CountryService } from '../services/country.service';

/**
 * Guard para proteger rutas públicas de usuarios ya autenticados.
 * Si el usuario ha iniciado sesión, lo redirige al dashboard.
 * De lo contrario, le permite el acceso a la ruta solicitada (ej. /login).
 */
export const publicGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const languageService = inject(LanguageService);
  const countryService = inject(CountryService);

  return authService.checkAuthStatus().pipe(
    take(1), // Toma el primer valor emitido y se desuscribe.
    map(isAuthenticated => {
      if (isAuthenticated) {
        const lang = languageService.currentLang();
        const country = countryService.currentCountryCode();
        // Si el usuario está autenticado, crea un UrlTree para redirigir al dashboard con contexto regional.
        return router.createUrlTree(['/', lang, country, 'accounting']);
      }
      // Si no está autenticado, permite el acceso a la ruta.
      return true;
    })
  );
};