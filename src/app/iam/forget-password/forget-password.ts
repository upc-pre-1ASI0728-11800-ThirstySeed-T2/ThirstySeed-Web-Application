import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
})
export class ForgetPasswordComponent {
  email = '';
  newPassword = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  resetPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const users = this.authService.getUsers();

    const user = users.find((u) => u.email.toLowerCase() === this.email.toLowerCase());

    if (!user) {
      this.errorMessage = 'No account was found with that email.';
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

    if (user.password === this.newPassword) {
      this.errorMessage = 'The new password must be different from the current password.';
      return;
    }

    const updated = this.authService.updatePassword(this.email, this.newPassword);

    if (!updated) {
      this.errorMessage = 'Unable to update password.';
      return;
    }

    this.successMessage = 'Password updated successfully.';

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }
}
