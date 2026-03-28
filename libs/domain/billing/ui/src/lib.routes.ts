import { Route } from '@angular/router';

export const billingRoutes: Route[] = [
  { path: '', loadComponent: () => import('./pages/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent) },
  { path: ':id', loadComponent: () => import('./pages/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent) },
];
