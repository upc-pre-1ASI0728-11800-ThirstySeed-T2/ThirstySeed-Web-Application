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

    if (this.authService.emailExists(this.email)) {
      this.errorMessage = 'Email already registered.';
      return;
    }

    if (this.username.trim().length < 4) {
      this.errorMessage = 'Username must contain at least 4 characters.';
      return;
    }

    if (this.authService.usernameExists(this.username)) {
      this.errorMessage = 'Username already exists.';
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

    this.authService.register({
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      username: this.username.trim(),
      accountType: this.accountType,
      password: this.password,
    });

    this.successMessage = 'Account created successfully. Redirecting to subscription...';

    setTimeout(() => {
      this.router.navigate(['/subscription']);
    }, 1500);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
