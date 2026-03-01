import { Route } from '@angular/router';

export const crmRoutes: Route[] = [
  { path: '', loadComponent: () => import('./pages/customer-list/customer-list.component').then(m => m.CustomerListComponent) },
  { path: 'pipeline', loadComponent: () => import('./pages/lead-pipeline/lead-pipeline.component').then(m => m.LeadPipelineComponent) },
];
