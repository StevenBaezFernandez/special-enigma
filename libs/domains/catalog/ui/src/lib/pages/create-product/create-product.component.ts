import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CatalogService, Product } from '../../core/services/catalog.service';

@Component({
  selector: 'virteex-create-product',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent {
  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  public router = inject(Router);

  errorMessage = signal<string | null>(null);

  productForm = this.fb.group({
    sku: ['', [Validators.required]],
    name: ['', [Validators.required]],
    price: ['', [Validators.required, Validators.min(0)]],
    isActive: [true]
  });

  onSubmit() {
    this.errorMessage.set(null);
    if (this.productForm.valid) {
      const formValue = this.productForm.value;

      const product: Omit<Product, 'id'> = {
        sku: formValue.sku!,
        name: formValue.name!,
        price: formValue.price!.toString(),
        isActive: formValue.isActive === true || formValue.isActive === undefined ? true : false
      };

      this.catalogService.createProduct(product).subscribe({
        next: () => {
          this.router.navigate(['/catalog/list']);
        },
        error: (err) => {
          console.error('Create product failed', err);
          this.errorMessage.set(err.error?.message || 'Failed to create product. Please try again.');
        }
      });
    }
  }
}
