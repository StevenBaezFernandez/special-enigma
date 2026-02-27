import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'catalog',
  },
  {
    path: 'catalog',
    loadComponent: () => import('@virteex/catalog-ui-store').then((m) => m.ProductListComponent),
  },
];
