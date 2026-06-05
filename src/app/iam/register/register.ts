import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

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
    private profileService: ProfileService,
  ) {}

  handleRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validaciones
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

    // Llamada al backend
    const fullNameParts = this.fullName.trim().split(' ');

    const firstName = fullNameParts[0];

    const lastName = fullNameParts.length > 1 ? fullNameParts.slice(1).join(' ') : '';

    const roleMap: Record<string, string> = {
      'Agricultural Producer': 'ROLE_PRODUCER',
      'Water Management Entity': 'ROLE_WATER_MANAGER',
    };

    const role = roleMap[this.accountType];

    this.authService
      .signUp({
        username: this.username.trim(),
        password: this.password,
        roles: [role],
      })
      .subscribe({
        next: () => {
          this.authService.signIn(this.username.trim(), this.password).subscribe({
            next: (user) => {
              const profilePayload = {
                userId: user.id,
                firstName,
                lastName,
                email: this.email,
                phoneNumber: '',
                profileImage: '',
                location: '',
              };
              console.log('PROFILE PAYLOAD', profilePayload);
              this.profileService.createProfile(profilePayload);

              this.profileService
                .createProfile({
                  userId: user.id,
                  firstName,
                  lastName,
                  email: this.email,
                  phoneNumber: '',
                  profileImage: '',
                  location: '',
                })
                .subscribe({
                  next: () => {
                    this.authService.setCurrentUser(user);

                    this.successMessage = 'Account created successfully.';

                    setTimeout(() => {
                      this.router.navigate(['/subscription']);
                    }, 1000);
                  },

                  error: (err) => {
                    console.error(err);

                    this.errorMessage = 'Profile creation failed.';
                  },
                });
            },

            error: (err) => {
              console.error(err);

              this.errorMessage = 'Automatic login failed.';
            },
          });
        },

        error: (err) => {
          console.error(err);

          this.errorMessage = err?.error?.message ?? 'Failed to create account.';
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
