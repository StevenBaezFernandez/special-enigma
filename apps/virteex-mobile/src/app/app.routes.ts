import { Route } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { InventoryPage } from './pages/inventory/inventory.page';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  { path: 'inventory', component: InventoryPage },
  {
    path: 'approvals',
    loadComponent: () => import('./pages/approvals/approvals.page').then(m => m.ApprovalsPage)
  },
  {
    path: 'crm',
    loadComponent: () => import('./pages/crm/crm.page').then(m => m.CrmPage)
  },
];
