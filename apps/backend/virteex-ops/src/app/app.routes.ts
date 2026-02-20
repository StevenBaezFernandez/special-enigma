import { Route } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { authGuard } from './core/auth/auth.guard';
import { LoginComponent } from './auth/login.component';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'tenants',
        loadComponent: () => import('./tenants/tenants.component').then(m => m.TenantsComponent),
      },
      {
        path: 'billing',
        loadComponent: () => import('./billing/billing.component').then(m => m.BillingComponent),
      },
      {
        path: 'feature-flags',
        loadComponent: () => import('./feature-flags/feature-flags.component').then(m => m.FeatureFlagsComponent),
      },
      {
        path: 'finops',
        loadComponent: () => import('./finops/finops.component').then(m => m.FinopsComponent),
      },
      {
        path: 'monitoring',
        loadComponent: () => import('./monitoring/monitoring.component').then(m => m.MonitoringComponent),
      },
      {
        path: 'plugins',
        loadComponent: () => import('./plugins/plugins.component').then(m => m.PluginsComponent),
      },
      {
        path: 'security',
        loadComponent: () => import('./security/security.component').then(m => m.SecurityComponent),
      },
      {
        path: 'support',
        loadComponent: () => import('./support/support.component').then(m => m.SupportComponent),
      },
      {
        path: 'automation',
        loadComponent: () => import('./automation/automation.component').then(m => m.AutomationComponent),
      },
      {
        path: 'config',
        loadComponent: () => import('./config/config.component').then(m => m.ConfigComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent),
      },
      {
        path: 'databases',
        loadComponent: () => import('./databases/databases.component').then(m => m.DatabasesComponent),
      },
      {
        path: 'queues',
        loadComponent: () => import('./queues/queues.component').then(m => m.QueuesComponent),
      },
      {
        path: 'storage',
        loadComponent: () => import('./storage/storage.component').then(m => m.StorageComponent),
      },
      {
        path: 'backups',
        loadComponent: () => import('./backups/backups.component').then(m => m.BackupsComponent),
      },
      {
        path: 'releases',
        loadComponent: () => import('./releases/releases.component').then(m => m.ReleasesComponent),
      },
      {
        path: 'docs',
        loadComponent: () => import('./docs/docs.component').then(m => m.DocsComponent),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notifications/notifications.component').then(m => m.NotificationsComponent),
      },
      {
        path: 'console-config',
        loadComponent: () => import('./console-config/console-config.component').then(m => m.ConsoleConfigComponent),
      },
      {
        path: 'import-export',
        loadComponent: () => import('./import-export/import-export.component').then(m => m.ImportExportComponent),
      },
      {
        path: 'testing',
        loadComponent: () => import('./testing/testing.component').then(m => m.TestingComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
