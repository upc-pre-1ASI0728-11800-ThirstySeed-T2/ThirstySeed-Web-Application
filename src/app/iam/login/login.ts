import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { NgIf } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
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
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const rememberedUsername = localStorage.getItem('rememberedUsername');
      if (rememberedUsername) {
        this.username = rememberedUsername;
        this.rememberMe = true;
      }
    }
  }

  handleSignIn(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Username and password are required.';
      return;
    }

    this.isLoading = true;

    this.authService.signIn(this.username, this.password).subscribe({
      next: (user: any) => {
        localStorage.setItem('userId', user.id);

        if (this.rememberMe) {
          localStorage.setItem('rememberedUsername', this.username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }

        this.isLoading = false;
        this.successMessage = 'Login successful.';
        this.router.navigate([this.authService.getRouteForCurrentUser()]);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Invalid username or password.';
      },
    });
  }

  goToSignUp(): void {
    this.router.navigate(['/register']);
  }

  goToForgotPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }
}
