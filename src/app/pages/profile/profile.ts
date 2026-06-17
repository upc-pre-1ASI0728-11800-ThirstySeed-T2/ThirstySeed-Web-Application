import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../iam/services/auth.service';
import { ProfileService, UserProfile } from '../../iam/services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
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

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.userId = user.id;
    this.email = user.email ?? user.username ?? '';

    this.profileService.getProfileByUserId(user.id).subscribe({
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

    const request$ = this.isEditing
      ? this.profileService.updateProfile(this.existingProfile!.id, payload)
      : this.profileService.createProfile(payload);

    request$.subscribe({
      next: (profile) => {
        this.existingProfile = profile;
        this.successMessage = this.isEditing
          ? 'Profile updated successfully.'
          : 'Profile created successfully.';
        this.saving = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to save profile. Please try again.';
        this.saving = false;
        this.cd.detectChanges();
      },
    });
  }
}
