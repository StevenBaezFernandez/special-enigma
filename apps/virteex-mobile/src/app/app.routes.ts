import { Route } from '@angular/router';
import { LoginPage } from './pages/login/login.page';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  // Dashboard route would be protected by an AuthGuard in a real implementation
  // { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage) }
];
