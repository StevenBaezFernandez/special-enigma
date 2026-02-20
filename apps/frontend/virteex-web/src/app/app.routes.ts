import { Route } from '@angular/router';
import { MainLayoutComponent } from '@virteex/shared-ui';
import { authGuard } from '@virteex/shared-util-auth';

export const appRoutes: Route[] = [
  // Country specific auth (e.g., /es/co/auth/...)
  {
    path: ':lang/:country/auth',
    loadChildren: () => import('@virteex/identity-ui').then(m => m.authRoutes)
  },
  // Language specific auth (e.g., /es/auth/...)
  {
    path: ':lang/auth',
    loadChildren: () => import('@virteex/identity-ui').then(m => m.authRoutes)
  },
  // Fallback or default auth
  {
    path: 'auth',
    loadChildren: () => import('@virteex/identity-ui').then(m => m.authRoutes)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'accounting', pathMatch: 'full' }, // Redirect root to accounting or a dashboard
      { path: 'accounting', loadChildren: () => import('@virteex/accounting-ui').then(m => m.accountingRoutes) },
      { path: 'inventory', loadChildren: () => import('@virteex/inventory-ui').then(m => m.inventoryRoutes) },
      { path: 'payroll', loadChildren: () => import('@virteex/payroll-ui').then(m => m.payrollRoutes) },
      { path: 'crm', loadChildren: () => import('@virteex/crm-ui').then(m => m.crmRoutes) },
      { path: 'purchasing', loadChildren: () => import('@virteex/purchasing-ui').then(m => m.purchasingRoutes) },
      { path: 'treasury', loadChildren: () => import('@virteex/treasury-ui').then(m => m.treasuryRoutes) },
      { path: 'fixed-assets', loadChildren: () => import('@virteex/fixed-assets-ui').then(m => m.fixedassetsRoutes) },
      { path: 'projects', loadChildren: () => import('@virteex/projects-ui').then(m => m.projectsRoutes) },
      { path: 'manufacturing', loadChildren: () => import('@virteex/manufacturing-ui').then(m => m.manufacturingRoutes) },
      { path: 'billing', loadChildren: () => import('@virteex/billing-ui').then(m => m.billingRoutes) },
      { path: 'catalog', loadChildren: () => import('@virteex/catalog-ui').then(m => m.catalogRoutes) },
      { path: 'bi', loadChildren: () => import('@virteex/bi-ui').then(m => m.biRoutes) },
      { path: 'admin', loadChildren: () => import('@virteex/admin-ui').then(m => m.adminRoutes) },
      { path: 'fiscal', loadChildren: () => import('@virteex/fiscal-ui').then(m => m.fiscalRoutes) },
      // { path: 'sample', loadChildren: () => import('@virteex/sample-ui').then(m => m.sampleRoutes) },
    ]
  }
];
