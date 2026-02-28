import { Component, Output, EventEmitter, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntentDetectionService } from '../../services/intent-detection.service';

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  currency: string;
  tax: string;
  invoiceType: string;
}

@Component({
  selector: 'virteex-country-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="country-selector-container mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">País de operación de tu empresa</label>
      <div class="relative">
        <select
          [(ngModel)]="selectedCountry"
          (ngModelChange)="onCountryChange()"
          class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
        >
          <option *ngFor="let c of countries" [value]="c.code">
            {{ c.flag }} {{ c.name }}
          </option>
        </select>
      </div>

      <!-- Context Info Card -->
      <div *ngIf="getSelectedCountryInfo() as info" class="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm">
        <div class="flex items-center space-x-2 mb-1">
          <span class="text-lg">{{ info.flag }}</span>
          <span class="font-bold text-gray-900">{{ info.name }}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div><span class="font-semibold">Moneda:</span> {{ info.currency }}</div>
          <div><span class="font-semibold">Impuesto:</span> {{ info.tax }}</div>
          <div class="col-span-2"><span class="font-semibold">Facturación:</span> {{ info.invoiceType }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .country-selector-container select {
      border: 1px solid #d1d5db;
    }
  `]
})
export class CountrySelectorComponent implements OnInit {
  @Input() selectedCountry = 'CO';
  @Output() countrySelected = new EventEmitter<string>();

  private intentService = inject(IntentDetectionService);

  countries: CountryInfo[] = [
    { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'COP', tax: 'IVA 19%', invoiceType: 'Electrónica DIAN' },
    { code: 'MX', name: 'México', flag: '🇲🇽', currency: 'MXN', tax: 'IVA 16%', invoiceType: 'CFDI 4.0' },
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', currency: 'USD', tax: 'Sales Tax (Variable)', invoiceType: 'Invoice' },
    { code: 'BR', name: 'Brasil', flag: '🇧🇷', currency: 'BRL', tax: 'ICMS/ISS', invoiceType: 'NF-e / NFS-e' },
    { code: 'PE', name: 'Perú', flag: '🇵🇪', currency: 'PEN', tax: 'IGV 18%', invoiceType: 'CPE SUNAT' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'ARS', tax: 'IVA 21%', invoiceType: 'Factura Electrónica AFIP' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'CLP', tax: 'IVA 19%', invoiceType: 'DTE SII' },
  ];

  ngOnInit() {
    // If we wanted to auto-detect based on IP if nothing is selected (or passed in URL), we could do it here.
    if (!this.selectedCountry) {
        this.intentService.analyzeContext('').subscribe(analysis => {
            if (analysis.detectedCountry && this.countries.some(c => c.code === analysis.detectedCountry)) {
                this.selectedCountry = analysis.detectedCountry;
                this.countrySelected.emit(this.selectedCountry);
            }
        });
    }
  }

  onCountryChange() {
    this.countrySelected.emit(this.selectedCountry);
  }

  getSelectedCountryInfo(): CountryInfo | undefined {
    return this.countries.find(c => c.code === this.selectedCountry);
  }
}
