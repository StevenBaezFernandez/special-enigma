import { Route } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ListComponent } from './pages/list/list.component';
import { MarketplacePage } from './pages/marketplace/marketplace.page';

export const adminRoutes: Route[] = [
  { path: '', component: DashboardComponent },
  { path: 'list', component: ListComponent },
  { path: 'marketplace', component: MarketplacePage },
];
