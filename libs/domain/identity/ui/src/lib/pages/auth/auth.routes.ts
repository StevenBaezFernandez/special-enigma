import { HttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { Routes } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { createAuthTranslateLoader } from '../../core/utils/auth-translate-loader';

// Importa el nuevo guard que acabamos de crear.
import { publicGuard } from '@virteex/shared-ui/core/guards/public.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'register',
    title: 'Crear Cuenta | FacturaPRO',
    // Aplica el guard a esta ruta.
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./register/register.page').then((m) => m.RegisterPage),
    providers: [
      importProvidersFrom(
        TranslateModule.forChild({
          loader: {
            provide: TranslateLoader,
            useFactory: (http: HttpClient) =>
              createAuthTranslateLoader(http, 'register'),
            deps: [HttpClient],
          },
          isolate: true,
        })
      ),
    ],
  },
  {
    path: 'login',
    title: 'Iniciar Sesión | FacturaPRO',
    // Aplica el guard a esta ruta.
    canActivate: [publicGuard],
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
    providers: [
      importProvidersFrom(
        TranslateModule.forChild({
          loader: {
            provide: TranslateLoader,
            useFactory: (http: HttpClient) =>
              createAuthTranslateLoader(http, 'login'),
            deps: [HttpClient],
          },
          isolate: true,
        })
      ),
    ],
  },
  {
    path: 'forgot-password',
    // Aplica el guard a esta ruta.
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./forgot-password/forgot-password/forgot-password.page').then(
        (m) => m.ForgotPasswordPage
      ),
    providers: [
      importProvidersFrom(
        TranslateModule.forChild({
          loader: {
            provide: TranslateLoader,
            useFactory: (http: HttpClient) =>
              createAuthTranslateLoader(http, 'forgot-password'),
            deps: [HttpClient],
          },
          isolate: true,
        })
      ),
    ],
  },
  {
    path: 'reset-password',
    // Aplica el guard a esta ruta.
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./reset-password/reset-password.page/reset-password.page').then(
        (m) => m.ResetPasswordPage
      ),
    providers: [
      importProvidersFrom(
        TranslateModule.forChild({
          loader: {
            provide: TranslateLoader,
            useFactory: (http: HttpClient) =>
              createAuthTranslateLoader(http, 'reset-password'),
            deps: [HttpClient],
          },
          isolate: true,
        })
      ),
    ],
  },
  {
    path: 'set-password',
    title: 'Configurar Contraseña',
    loadComponent: () =>
      import('./set-password/set-password.page').then((m) => m.SetPasswordPage),
    providers: [
      importProvidersFrom(
        TranslateModule.forChild({
          loader: {
            provide: TranslateLoader,
            useFactory: (http: HttpClient) =>
              createAuthTranslateLoader(http, 'set-password'),
            deps: [HttpClient],
          },
          isolate: true,
        })
      ),
    ],
  },
  {
    path: 'plan-selection',
    title: 'Seleccionar Plan | FacturaPRO',
    loadComponent: () =>
      import('../payment/components/plan-selection/plan-selection.component').then(
        (m) => m.PlanSelectionComponent
      ),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
