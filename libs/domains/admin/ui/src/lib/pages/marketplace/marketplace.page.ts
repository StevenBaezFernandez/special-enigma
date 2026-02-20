import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'virteex-marketplace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketplace.page.html',
  styles: [`
    .marketplace-container { padding: 20px; }
    .plugin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
    .plugin-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: white; }
    .meta { display: flex; justify-content: space-between; font-size: 0.9em; color: #666; margin: 10px 0; }
    button { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%; }
    button:disabled { background: #ccc; cursor: default; }
  `]
})
export class MarketplacePage {
  // In a real implementation, this would fetch from a PluginRegistryService
  plugins = [
    { id: 'p1', name: 'Advanced Reporting', description: 'Custom BI reports for retail.', version: '1.0.2', author: 'Virteex', installed: false },
    { id: 'p2', name: 'Shopify Connector', description: 'Sync inventory with Shopify.', version: '2.1.0', author: 'Connectify', installed: true },
    { id: 'p3', name: 'Payroll MX', description: 'CFDI 4.0 Payroll stamping.', version: '1.5.0', author: 'FiscalDevs', installed: false },
  ];

  install(pluginId: string) {
    // Call backend to install plugin
    console.log('Installing plugin:', pluginId);
    const plugin = this.plugins.find(p => p.id === pluginId);
    if (plugin) plugin.installed = true;
  }
}
