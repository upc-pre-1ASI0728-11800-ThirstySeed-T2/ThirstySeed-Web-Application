import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';

  rememberMe = false;
  showPassword = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const rememberedEmail = localStorage.getItem('rememberedEmail');

    if (rememberedEmail) {
      this.username = rememberedEmail;
      this.rememberMe = true;
    }
  }

  handleSignIn(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username.trim()) {
      this.errorMessage = 'Email is required.';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Password is required.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.username)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    const user = this.authService.login(this.username, this.password);

    if (!user) {
      this.errorMessage = 'Invalid email or password.';
      return;
    }

    if (this.rememberMe) {
      localStorage.setItem('rememberedEmail', this.username);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.successMessage = 'Login successful.';

    console.log('Logged user:', user);

    this.router.navigate(['/account']);
  }

  goToSignUp(): void {
    this.router.navigate(['/register']);
  }

  goToForgotPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }
}
