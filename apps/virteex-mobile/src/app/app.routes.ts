import { Route } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { InventoryPage } from './pages/inventory/inventory.page';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'inventory', component: InventoryPage },
  // Dashboard route would be protected by an AuthGuard in a real implementation
  // { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage) }
];
