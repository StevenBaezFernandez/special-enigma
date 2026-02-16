import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { InvoicesService, CreateInvoiceDto } from '../../../core/services/invoices';
import { CustomersService } from '../../../core/api/customers.service';
import { InventoryService } from '../../../core/api/inventory.service';
import { SatCatalogService, SatCatalogItem } from '../../../../../../shared/ui/src/lib/core/api/sat-catalog.service';
import { Customer } from '../../../core/models/customer.model';
import { Product } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'virteex-new-invoice-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './new.page.html',
  styleUrls: ['./new.page.scss'],
})
export class NewInvoicePage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private invoicesService = inject(InvoicesService);
  private customersService = inject(CustomersService);
  private inventoryService = inject(InventoryService);
  private notificationService = inject(NotificationService);
  private satCatalogService = inject(SatCatalogService);

  invoiceForm: FormGroup;
  customers: Customer[] = [];
  products: Product[] = [];

  paymentForms: SatCatalogItem[] = [];
  paymentMethods: SatCatalogItem[] = [];
  cfdiUsages: SatCatalogItem[] = [];

  constructor() {
    this.invoiceForm = this.fb.group({
      customerId: ['', Validators.required],
      issueDate: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: ['', Validators.required],
      paymentForm: ['03', Validators.required],
      paymentMethod: ['PUE', Validators.required],
      usage: ['G03', Validators.required],
      notes: [''],
      lineItems: this.fb.array([this.createLineItem()]),
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.loadSatCatalogs();
  }

  loadInitialData(): void {
    this.customersService.getCustomers().subscribe((data) => (this.customers = data));
    this.inventoryService.getProducts().subscribe((data) => (this.products = data));
  }

  loadSatCatalogs(): void {
      this.satCatalogService.getPaymentForms().subscribe(data => this.paymentForms = data);
      this.satCatalogService.getPaymentMethods().subscribe(data => this.paymentMethods = data);
      this.satCatalogService.getCfdiUsages().subscribe(data => this.cfdiUsages = data);
  }

  get lineItems(): FormArray {
    return this.invoiceForm.get('lineItems') as FormArray;
  }

  createLineItem(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [{ value: 0, disabled: false }, [Validators.required, Validators.min(0)]],
      taxRate: [0.16, [Validators.required, Validators.min(0), Validators.max(1)]],
    });
  }

  addLineItem(): void {
    this.lineItems.push(this.createLineItem());
  }

  removeLineItem(index: number): void {
    if (this.lineItems.length > 1) {
        this.lineItems.removeAt(index);
    }
  }

  onProductSelect(index: number): void {
    const productId = this.lineItems.at(index).get('productId')?.value;
    const selectedProduct = this.products.find((p) => p.id === productId);
    if (selectedProduct) {
      this.lineItems.at(index).patchValue({
        description: selectedProduct.name,
        price: selectedProduct.price,
        taxRate: 0.16 // Could be fetched from product category in future
      });
    }
  }

  get totals() {
    let subtotal = 0;
    let tax = 0;

    this.lineItems.controls.forEach((control) => {
        const qty = control.get('quantity')?.value || 0;
        const price = control.get('price')?.value || 0;
        const taxRate = control.get('taxRate')?.value || 0;

        const lineTotal = qty * price;
        subtotal += lineTotal;
        tax += lineTotal * taxRate;
    });

    return {
        subtotal,
        tax,
        total: subtotal + tax
    };
  }

  // Validator to check stock
  validateStock(index: number): boolean {
      const control = this.lineItems.at(index);
      const productId = control.get('productId')?.value;
      const qty = control.get('quantity')?.value;

      if (!productId) return true;

      const product = this.products.find(p => p.id === productId);
      if (product && (qty > product.stock)) {
          return false;
      }
      return true;
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.notificationService.showError('Por favor, completa todos los campos requeridos.');
      return;
    }

    // Validate stock for all items explicitly
    for (let i = 0; i < this.lineItems.length; i++) {
        if (!this.validateStock(i)) {
            this.notificationService.showError(`Stock insuficiente para el producto en la línea ${i + 1}`);
            return;
        }
    }

    const formValue = this.invoiceForm.getRawValue();

    // Explicit typing
    const items = formValue.lineItems.map((item: { productId: string; quantity: number; price: number; description: string; taxRate: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        description: item.description
    }));

    const payload: CreateInvoiceDto = {
        customerId: formValue.customerId,
        issueDate: formValue.issueDate,
        dueDate: formValue.dueDate,
        paymentForm: formValue.paymentForm,
        paymentMethod: formValue.paymentMethod,
        usage: formValue.usage,
        notes: formValue.notes,
        items: items
    };

    this.invoicesService.createInvoice(payload).subscribe({
      next: () => {
        this.notificationService.showSuccess('Factura creada exitosamente.');
        this.router.navigate(['/app/invoices']);
      },
      error: (err) => {
        this.notificationService.showError(`Error al crear la factura: ${err.message}`);
      },
    });
  }
}
