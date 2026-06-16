import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  fullName = '';
  email = '';
  username = '';
  accountType = '';

  password = '';
  confirmPassword = '';

  acceptedTerms = false;
  showPassword = false;
  showConfirmPassword = false;

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  handleRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.fullName.trim().length < 3) {
      this.errorMessage = 'Full name must contain at least 3 characters.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (this.username.trim().length < 4) {
      this.errorMessage = 'Username must contain at least 4 characters.';
      return;
    }

    if (!this.accountType) {
      this.errorMessage = 'Please select an account type.';
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.errorMessage =
        'Password must have at least 8 characters, one uppercase letter and one number.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.acceptedTerms) {
      this.errorMessage = 'You must accept the terms and privacy policy.';
      return;
    }

    const roleMap: Record<string, string> = {
      'Agricultural Producer': 'ROLE_PRODUCER',
      'Water Management Entity': 'ROLE_WATER_MANAGER',
    };

    const role = roleMap[this.accountType];
    this.isLoading = true;

    this.authService.signUp({
      username: this.username.trim(),
      password: this.password,
      roles: [role],
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully. Please log in.';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ?? 'Failed to create account. Please try again.';
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
