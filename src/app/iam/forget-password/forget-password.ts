import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
})
export class ForgetPasswordComponent {
  email = '';
  newPassword = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';

  private backendUrl = `${environment.apiBaseUrl}/api/v1/profiles`;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  resetPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

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

    // Traer profile por email
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Buscar el profile del usuario por email
    this.http.get<any[]>(`${this.backendUrl}`).subscribe({
      next: (profiles) => {
        const profile = profiles.find(p => p.email.toLowerCase() === this.email.toLowerCase());
        if (!profile) {
          this.errorMessage = 'No account was found with that email.';
          return;
        }

        // Actualizar la contraseña en backend
        this.http.put(`${this.backendUrl}/${profile.id}/password`, { newPassword: this.newPassword }, { headers }).subscribe({
          next: () => {
            this.successMessage = 'Password updated successfully.';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1500);
          },
          error: () => {
            this.errorMessage = 'Unable to update password.';
          }
        });
      },
      error: () => {
        this.errorMessage = 'Unable to fetch profiles.';
      }
    });
  }
}
