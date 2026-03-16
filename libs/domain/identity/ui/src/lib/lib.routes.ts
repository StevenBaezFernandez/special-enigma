import { Route } from '@angular/router';

export const authRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import(
        './pages/auth/forgot-password/forgot-password/forgot-password.page'
      ).then((m) => m.ForgotPasswordPage),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/auth/reset-password/reset-password.page/reset-password.page').then(
        (m) => m.ResetPasswordPage
      ),
  },
  {
    path: 'set-password',
    loadComponent: () =>
      import('./pages/auth/set-password/set-password.page').then((m) => m.SetPasswordPage),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
