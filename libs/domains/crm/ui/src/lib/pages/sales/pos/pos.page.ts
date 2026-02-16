import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
} from 'lucide-angular';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Product } from '../../../core/models/product.model';
import { CrmService } from '../../../core/services/crm.service';
import { CreateSaleDto } from '../../../core/models/sale.model';
import { Customer } from '../../../core/models/customer.model';
import { ToastService } from '@virteex/shared-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'virteex-pos-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './pos.page.html',
  styleUrls: ['./pos.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PosPage implements OnInit {
  private fb = inject(FormBuilder);
  private crmService = inject(CrmService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  protected readonly SearchIcon = Search;
  protected readonly XIcon = X;
  protected readonly PlusIcon = Plus;
  protected readonly MinusIcon = Minus;
  protected readonly TrashIcon = Trash2;
  protected readonly CreditCardIcon = CreditCard;

  allProducts = signal<Product[]>([]);
  customers = signal<Customer[]>([]);
  isLoading = signal(false);
  taxRate = signal(0.16); // Default, updated on init

  saleForm!: FormGroup;

  private formChanges = toSignal(this.saleForm?.valueChanges || { subscribe: () => {} }, {
    initialValue: {},
  });

  subtotal = computed(() => {
    if (!this.saleForm) return 0;
    return this.cartItems.controls.reduce((acc, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      return acc + quantity * price;
    }, 0);
  });

  taxAmount = computed(() => this.subtotal() * this.taxRate());
  total = computed(() => this.subtotal() + this.taxAmount());

  ngOnInit(): void {
    // Initialize default language
    this.translate.setDefaultLang('es');
    this.translate.use('es');

    this.saleForm = this.fb.group({
      cartItems: this.fb.array([]),
      customer: [''], // Will hold customer ID
    });

    this.loadProducts();
    this.loadCustomers();
    this.loadTaxRate();
  }

  loadTaxRate(): void {
      this.crmService.getTaxRate().subscribe({
          next: (res) => this.taxRate.set(res.rate),
          error: (err) => console.error('Error fetching tax rate', err)
      });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.crmService.getProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.showError(this.translate.instant('POS.PRODUCTS_LOAD_ERROR'));
      },
    });
  }

  loadCustomers(): void {
    this.crmService.getCustomers().subscribe({
        next: (customers) => {
            this.customers.set(customers);
            if (customers.length > 0) {
                this.saleForm.get('customer')?.setValue(customers[0].id);
            }
        },
        error: (err) => {
          console.error('Error loading customers', err);
          this.toast.showError(this.translate.instant('POS.CUSTOMERS_LOAD_ERROR'));
        }
    });
  }

  get cartItems(): FormArray {
    return this.saleForm.get('cartItems') as FormArray;
  }

  addToCart(product: Product): void {
    const existingItem = this.cartItems.controls.find(
      (control) => control.get('productId')?.value === product.id,
    );
    if (existingItem) {
      existingItem
        .get('quantity')
        ?.setValue(existingItem.get('quantity')?.value + 1);
    } else {
      const newItem = this.fb.group({
        productId: [product.id],
        name: [product.name],
        price: [product.price],
        quantity: [1],
      });
      this.cartItems.push(newItem);
    }
  }

  updateQuantity(index: number, change: number): void {
    const item = this.cartItems.at(index);
    const newQuantity = (item.get('quantity')?.value || 0) + change;
    if (newQuantity > 0) {
      item.get('quantity')?.setValue(newQuantity);
    } else {
      this.cartItems.removeAt(index);
    }
  }

  removeItem(index: number): void {
    this.cartItems.removeAt(index);
  }

  getItemTotal(item: any): number {
    return (item.get('quantity')?.value || 0) * (item.get('price')?.value || 0);
  }

  completeSale(): void {
    if (this.saleForm.valid && this.cartItems.length > 0) {
      this.isLoading.set(true);

      const customerId = this.saleForm.get('customer')?.value;

      const salePayload: CreateSaleDto = {
        customerId: customerId,
        items: this.cartItems.value.map((item: any) => ({
          productId: item.productId,
          // productName removed to match DTO
          price: item.price,
          quantity: item.quantity,
        })),
      };

      this.crmService.createSale(salePayload).subscribe({
        next: () => {
          this.cartItems.clear();
          // Reset customer to first if available
          const customers = this.customers();
          if (customers.length > 0) {
              this.saleForm.get('customer')?.setValue(customers[0].id);
          }
          this.isLoading.set(false);
          this.toast.showSuccess(this.translate.instant('POS.SALE_SUCCESS'));
        },
        error: () => {
          this.toast.showError(this.translate.instant('POS.SALE_ERROR'));
          this.isLoading.set(false);
        },
      });
    }
  }
}
