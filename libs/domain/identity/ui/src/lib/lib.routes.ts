import { Route } from '@angular/router';
import { AUTH_ROUTES } from './pages/auth/auth.routes';
import { authGuard } from '@virteex/shared-ui';

// Public authentication routes
export const authRoutes: Route[] = [
  ...AUTH_ROUTES
];

// Private identity management routes
export const identityManagementRoutes: Route[] = [
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/my-profile.page').then(m => m.MyProfilePage),
    title: 'Mi Perfil | FacturaPRO'
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user-management/user-management.page').then(m => m.UserManagementPage),
    title: 'Gestión de Usuarios | FacturaPRO'
  },
  {
    path: 'roles',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/roles/roles.page').then(m => m.RolesManagementPage),
    title: 'Roles y Permisos | FacturaPRO'
  }
];
