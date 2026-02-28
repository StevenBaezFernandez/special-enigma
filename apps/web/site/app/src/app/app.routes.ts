import { Component } from '@angular/core';
import { Route } from '@angular/router';

@Component({
  selector: 'virteex-shell-home',
  standalone: true,
  template: '<p>Shell base listo.</p>',
})
class ShellHomeComponent {}

export const appRoutes: Route[] = [
  {
    path: '',
    component: ShellHomeComponent,
  },
];
