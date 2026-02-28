import { Route } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ListComponent } from './pages/list/list.component';

export const fiscalRoutes: Route[] = [
  { path: '', component: DashboardComponent },
  { path: 'list', component: ListComponent },
];
