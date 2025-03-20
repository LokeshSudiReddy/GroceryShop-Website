import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../service/admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  products: any[] = [];
  allProducts: any[] = []; // Store all products initially
  searchProductForm!: FormGroup;
  isSpinning = false;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.searchProductForm = this.fb.group({
      title: [null, [Validators.required]],
    });
    this.getAllProducts();
  }

  getAllProducts(): void {
    this.isSpinning = true;
    this.products = [];
    this.adminService.getAllProducts().subscribe((res) => {
      this.allProducts = res.map(element => ({
        ...element,
        processedImg: 'data:image/jpeg;base64,' + element.returnedImg
      }));
      this.products = [...this.allProducts]; // Initialize filtered products
      this.isSpinning = false;
    });
  }

  submitForm(): void {
    const title = this.searchProductForm.get('title')!.value?.toLowerCase().trim();
    if (title) {
      this.products = this.allProducts.filter(product =>
        product.name.toLowerCase().includes(title) ||
        product.categoryName.toLowerCase().includes(title) // Filter by category name
      );
    } else {
      this.products = [...this.allProducts]; // Reset if input is empty
    }
  }

  deleteProduct(productId: any): void {
    this.adminService.deleteProductById(productId).subscribe((res) => {
      if (res.body == null) {
        this.snackBar.open('Product Deleted Successfully!', 'Close', { duration: 5000 });
        this.getAllProducts(); // Refresh product list after deletion
      } else {
        this.snackBar.open(res.message, 'Close', { duration: 5000, panelClass: 'error-snackbar' });
      }
    });
  }
}
