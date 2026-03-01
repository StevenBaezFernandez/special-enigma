import { Route } from '@angular/router';

export const accountingRoutes: Route[] = [
  { path: '', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'accounts', loadComponent: () => import('./pages/chart-of-accounts/chart-of-accounts.component').then(m => m.ChartOfAccountsComponent) },
  { path: 'journal-entries', loadComponent: () => import('./pages/journal-entries/journal-entries.component').then(m => m.JournalEntriesComponent) },
];
