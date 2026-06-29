import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../iam/services/auth.service';
import { ProfileService, UserProfile } from '../../iam/services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  existingProfile: UserProfile | null = null;

  firstName = '';
  lastName = '';
  email = '';
  phoneNumber = '';
  location = '';

  private userId = 0;

  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.userId = user.id;
    this.email = user.email ?? user.username ?? '';

    this.profileService.getProfileByUserId(user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (profile) => {
        if (profile) {
          this.existingProfile = profile;
          this.firstName = profile.firstName;
          this.lastName = profile.lastName;
          this.email = profile.email;
          this.phoneNumber = profile.phoneNumber;
          this.location = profile.location;
        }
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  get isEditing(): boolean {
    return !!this.existingProfile;
  }

  get fullName(): string {
    return [this.firstName, this.lastName].filter(Boolean).join(' ') || '—';
  }

  skipToDashboard(): void {
    this.router.navigate([this.authService.getRouteForCurrentUser()]);
  }

  save(): void {
    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.errorMessage = 'First name and last name are required.';
      return;
    }
    if (!this.email.trim()) {
      this.errorMessage = 'Email is required.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      userId: this.userId,
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      phoneNumber: this.phoneNumber.trim(),
      location: this.location.trim(),
    };

    const wasCreating = !this.isEditing;

    const request$ = wasCreating
      ? this.profileService.createProfile(payload)
      : this.profileService.updateProfile(this.existingProfile!.id, payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (profile) => {
        this.existingProfile = profile;
        this.saving = false;
        if (wasCreating) {
          this.router.navigate([this.authService.getRouteForCurrentUser()]);
        } else {
          this.successMessage = 'Profile updated successfully.';
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to save profile. Please try again.';
        this.saving = false;
        this.cd.detectChanges();
      },
    });
  }
}
