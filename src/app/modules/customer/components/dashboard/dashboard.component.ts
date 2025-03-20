import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../service/customer.service';

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
    private customerService: CustomerService,
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
    this.customerService.getAllProducts().subscribe((res) => {
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
    if (!title) {
      this.products = [...this.allProducts]; // Reset if input is empty
      return;
    }

    // Filter based on exact match or close match using Levenshtein Distance
    this.products = this.allProducts.filter(product =>
      this.isSimilar(title, product.name.toLowerCase()) || 
      this.isSimilar(title, product.categoryName.toLowerCase())
    );
  }

  /**
   * Calculates Levenshtein Distance between two strings.
   * If the difference is small, considers them as similar.
   */
  private isSimilar(input: string, target: string): boolean {
    const distance = this.levenshteinDistance(input, target);
    const threshold = Math.floor(target.length * 0.3); // Allow up to 30% difference
    return distance <= threshold;
  }

  /**
   * Levenshtein Distance Algorithm (Edit Distance)
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // Deletion
          matrix[i][j - 1] + 1,     // Insertion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }

    return matrix[a.length][b.length];
  }

  addToCart(productId: any) {
    this.customerService.addToCart(productId).subscribe((res) => {
      if (res.id != null) {
        this.snackBar.open("Product added to cart successfully", "Close", { duration: 5000 });
      } else {
        this.snackBar.open("Product already exists in the cart", "Close", { duration: 5000 });
      }
    });
  }
}
