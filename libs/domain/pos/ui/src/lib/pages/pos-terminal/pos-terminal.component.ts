import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'virteex-pos-terminal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pos-container p-6 bg-gray-100 min-h-screen">
      <header class="mb-8 flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 class="text-3xl font-bold text-blue-800">POS Terminal</h1>
        <div class="status flex items-center gap-4">
          <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Online</span>
          <span class="text-gray-600 font-mono">{{ today | date:'medium' }}</span>
        </div>
      </header>

      <main class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Product Grid -->
        <section class="lg:col-span-2 bg-white p-6 rounded shadow min-h-[600px]">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold">Products</h2>
            <div class="search-box">
              <input type="text" placeholder="Search products..." class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <!-- Product grid list -->
            <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="product-card border rounded p-4 hover:shadow-md cursor-pointer transition-shadow">
              <div class="w-full h-32 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-400">
                <span>Product {{ i }}</span>
              </div>
              <h3 class="font-medium text-gray-800">Sample Item {{ i }}</h3>
              <p class="text-blue-600 font-bold">$ {{ i * 10.99 | number:'1.2-2' }}</p>
            </div>
          </div>
        </section>

        <!-- Cart / Receipt -->
        <aside class="bg-white p-6 rounded shadow flex flex-col min-h-[600px]">
          <h2 class="text-xl font-semibold mb-6 border-b pb-2">Current Cart</h2>

          <div class="cart-items flex-grow overflow-y-auto mb-6">
            <div class="text-center text-gray-500 mt-20">
              <p>Cart is empty</p>
              <button class="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-600">Scan Barcode</button>
            </div>
          </div>

          <div class="totals border-t pt-4 space-y-3">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>$ 0.00</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Tax (16%)</span>
              <span>$ 0.00</span>
            </div>
            <div class="flex justify-between text-2xl font-bold text-gray-900 border-t pt-3">
              <span>Total</span>
              <span>$ 0.00</span>
            </div>

            <button class="w-full py-4 mt-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg active:transform active:scale-95 disabled:bg-gray-400" disabled>
              PAY NOW
            </button>
          </div>
        </aside>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --color-primary: #0052CC;
      --color-primary-dark: #0747A6;
      --color-primary-light: #DEEBFF;
      --color-success: #00875A;
      --color-warning: #FF8B00;
      --color-error: #DE350B;
      --color-info: #00B8D9;
      --color-text-primary: #172B4D;
      --color-text-secondary: #42526E;
      --color-text-tertiary: #6B778C;
      --color-background: #FFFFFF;
      --color-surface: #F4F5F7;
      --color-border: #DFE1E6;
      --spacing-unit: 4px;
      --spacing-sm: calc(var(--spacing-unit) * 2);
      --spacing-md: calc(var(--spacing-unit) * 3);
      --spacing-lg: calc(var(--spacing-unit) * 4);
      --radius-md: 4px;
    }

    .pos-container { background-color: var(--color-surface); min-height: 100vh; padding: var(--spacing-lg); box-sizing: border-box; }
    .bg-white { background-color: var(--color-background); }
    .bg-gray-100 { background-color: var(--color-surface); }
    .bg-gray-200 { background-color: #e5e7eb; }
    .bg-blue-50 { background-color: #eff6ff; }
    .bg-green-100 { background-color: #dcfce7; }
    .text-blue-800 { color: var(--color-primary); }
    .text-blue-600 { color: #2563eb; }
    .text-green-800 { color: var(--color-success); }
    .text-gray-400 { color: #9ca3af; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: var(--color-text-secondary); }
    .text-gray-800 { color: var(--color-text-primary); }
    .text-gray-900 { color: #111827; }
    .border { border: 1px solid var(--color-border); }
    .border-t { border-top: 1px solid var(--color-border); }
    .border-b { border-bottom: 1px solid var(--color-border); }
    .rounded { border-radius: var(--radius-md); }
    .rounded-full { border-radius: 9999px; }
    .rounded-lg { border-radius: 0.5rem; }
    .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (min-width: 768px) { .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (min-width: 1024px) {
      .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .lg\:col-span-2 { grid-column: span 2 / span 2; }
    }
    @media (min-width: 1280px) { .xl\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-grow { flex-grow: 1; }
    .justify-between { justify-content: space-between; }
    .items-center { align-items: center; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .pb-2 { padding-bottom: 0.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-20 { margin-top: 5rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .w-full { width: 100%; }
    .h-32 { height: 8rem; }
    .bg-blue-600 { background-color: #2563eb; }
    .text-white { color: #ffffff; }
    .cursor-pointer { cursor: pointer; }
    .transition-shadow { transition: box-shadow 150ms; }
    .transition-colors { transition: color 150ms, background-color 150ms; }
    .overflow-y-auto { overflow-y: auto; }
    .product-card:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .hover\:bg-blue-700:hover { background-color: #1d4ed8; }
  `]
})
export class PosTerminalComponent {
  today = new Date();
}
