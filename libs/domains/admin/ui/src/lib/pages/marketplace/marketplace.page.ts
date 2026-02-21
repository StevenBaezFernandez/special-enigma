import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  installed: boolean;
  status?: 'installing' | 'active' | 'inactive';
}

@Component({
  selector: 'virteex-marketplace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketplace.page.html',
  styles: [`
    .marketplace-container { padding: 20px; }
    .plugin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .plugin-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: white; transition: transform 0.2s; }
    .plugin-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .meta { display: flex; justify-content: space-between; font-size: 0.9em; color: #666; margin: 10px 0; }
    button { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%; font-weight: bold; }
    button:disabled { background: #ccc; cursor: default; }
    button.installed { background: #28a745; cursor: default; }
    button.installing { background: #ffc107; cursor: wait; color: #333; }
  `]
})
export class MarketplacePage implements OnInit {
  plugins: Plugin[] = [
    { id: 'p1', name: 'Advanced Reporting', description: 'Custom BI reports for retail.', version: '1.0.2', author: 'Virteex', installed: false },
    { id: 'p2', name: 'Shopify Connector', description: 'Sync inventory with Shopify.', version: '2.1.0', author: 'Connectify', installed: false },
    { id: 'p3', name: 'Payroll MX', description: 'CFDI 4.0 Payroll stamping.', version: '1.5.0', author: 'FiscalDevs', installed: false },
    { id: 'p4', name: 'WMS Integration', description: 'Warehouse Management System v2.', version: '3.0.0', author: 'LogisticsPro', installed: false },
  ];

  ngOnInit() {
    this.loadInstalledPlugins();
  }

  loadInstalledPlugins() {
    const installed = localStorage.getItem('virteex_installed_plugins');
    if (installed) {
        const ids = JSON.parse(installed) as string[];
        this.plugins = this.plugins.map(p => ({
            ...p,
            installed: ids.includes(p.id),
            status: ids.includes(p.id) ? 'active' : undefined
        }));
    }
  }

  async install(pluginId: string) {
    const pluginIndex = this.plugins.findIndex(p => p.id === pluginId);
    if (pluginIndex === -1) return;

    // Optimistic UI
    this.plugins[pluginIndex].status = 'installing';

    // Simulate backend call
    console.log('Installing plugin:', pluginId);

    setTimeout(() => {
        this.plugins[pluginIndex].installed = true;
        this.plugins[pluginIndex].status = 'active';
        this.saveState();
        console.log('Plugin installed:', pluginId);
    }, 1500);
  }

  saveState() {
      const installedIds = this.plugins.filter(p => p.installed).map(p => p.id);
      localStorage.setItem('virteex_installed_plugins', JSON.stringify(installedIds));
  }
}
