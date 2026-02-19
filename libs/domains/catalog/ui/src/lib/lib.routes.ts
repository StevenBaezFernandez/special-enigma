import { Route } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ListComponent } from './pages/list/list.component';
import { CreateProductComponent } from './pages/create-product/create-product.component';

export const catalogRoutes: Route[] = [
  { path: '', component: DashboardComponent },
  { path: 'list', component: ListComponent },
  { path: 'create', component: CreateProductComponent },
];
