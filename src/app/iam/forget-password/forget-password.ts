import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgetPasswordComponent {
  username = '';
  newPassword = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  private changePasswordUrl = `${environment.apiBaseUrl}/api/v1/authentication/change-password`;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
  ) {}

  resetPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username.trim()) {
      this.errorMessage = 'Username is required.';
      return;
    }

    if (!this.newPassword.trim()) {
      this.errorMessage = 'Password is required.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;
    if (!passwordRegex.test(this.newPassword)) {
      this.errorMessage =
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.';
      return;
    }

    this.isLoading = true;
    this.http
      .put(this.changePasswordUrl, { username: this.username.trim(), newPassword: this.newPassword })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Password updated successfully.';
          this.cd.markForCheck();
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Unable to update password. Please check your username.';
          this.cd.markForCheck();
        },
      });
  }
}
