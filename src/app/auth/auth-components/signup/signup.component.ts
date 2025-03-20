import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../auth-services/auth-service/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  signupForm!: FormGroup;
  isSpinning = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email, this.emailDomainValidator]],
      phnumber: [null, [Validators.required, Validators.pattern('^[0-9]{10}$')]], 
      password: [null, [Validators.required]],
      confirmPassword: [null, [Validators.required]],
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  // Custom validator for email to check for @gmail.com domain
  emailDomainValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (email && !email.endsWith('@gmail.com')) {
      return { 'emailDomain': 'Email must be from @gmail.com domain' };
    }
    return null;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const password = this.signupForm.get('password')?.value;
      const confirmPassword = this.signupForm.get('confirmPassword')?.value;

      if (password !== confirmPassword) {
        this.snackBar.open('Passwords do not match.', 'Close', { duration: 5000, panelClass: 'error-snackbar' });
        return;
      }

      this.isSpinning = true;

      // Perform the signup logic here
      this.authService.register(this.signupForm.value).subscribe(
        (response) => {
          this.isSpinning = false;
          console.log(response);
          this.snackBar.open('Sign up successful!', 'Close', { duration: 5000 });
          this.router.navigateByUrl("/login");
        },
        (error) => {
          this.isSpinning = false;
          this.snackBar.open('Sign up failed. Please try again.', 'Close', { duration: 5000, panelClass: 'error-snackbar' });
        }
      );
    } else {
      for (const i in this.signupForm.controls) {
        this.signupForm.controls[i].markAsDirty();
        this.signupForm.controls[i].updateValueAndValidity();
      }
    }
  }
}
