import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'virteex-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggle],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  isSidebarOpen = true;

  navItems = [
    { path: '/accounting', label: 'Accounting', icon: 'icon-accounting' },
    { path: '/inventory', label: 'Inventory', icon: 'icon-inventory' },
    { path: '/payroll', label: 'Payroll', icon: 'icon-payroll' },
    { path: '/crm', label: 'CRM', icon: 'icon-crm' },
    { path: '/purchasing', label: 'Purchasing', icon: 'icon-purchasing' },
    { path: '/treasury', label: 'Treasury', icon: 'icon-treasury' },
    { path: '/fixed-assets', label: 'Fixed Assets', icon: 'icon-fixed-assets' },
    { path: '/projects', label: 'Projects', icon: 'icon-projects' },
    { path: '/manufacturing', label: 'Manufacturing', icon: 'icon-manufacturing' },
    { path: '/billing', label: 'Billing', icon: 'icon-billing' },
    { path: '/catalog', label: 'Catalog', icon: 'icon-catalog' },
    { path: '/bi', label: 'BI', icon: 'icon-bi' },
    { path: '/admin', label: 'Admin', icon: 'icon-admin' },
    { path: '/fiscal', label: 'Fiscal', icon: 'icon-fiscal' },
  ];

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
