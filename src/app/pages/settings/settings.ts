import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../iam/services/auth.service';
import { SettingsService, ProfilePayload } from './services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class SettingsComponent implements OnInit {
  private readonly LOCAL_PROFILE_KEY = 'settingsProfile';
  private readonly PROFILE_MISSING_KEY = 'settingsProfileMissing';

  form!: FormGroup;

  userId = '';
  profileId = '';
  currentUser: User | null = null;

  loading = true;
  saving = false;
  subscription: any;
  successMessage = '';
  errorMessage = '';
  profileMissing = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.userId = localStorage.getItem('userId') || String(this.currentUser?.id ?? '');

    if (!this.userId || !this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const storedProfile = this.getStoredProfile();

    this.form = this.fb.group({
      name: [
        storedProfile?.fullName || this.currentUser.fullName || this.currentUser.username || '',
        [Validators.required],
      ],
      email: [storedProfile?.email || this.currentUser.email || '', [Validators.required, Validators.email]],
    });

    this.profileId = storedProfile?.id ? String(storedProfile.id) : '';

    this.loadProfile();
    this.loadSubscription();
  }

  get displayName(): string {
    return this.form?.value?.name || this.currentUser?.username || 'User';
  }

  get displayEmail(): string {
    return this.form?.value?.email || 'Add your email';
  }

  get roleLabel(): string {
    const role = this.currentUser?.roles?.[0] ?? '';
    return role.replace('ROLE_', '').replace('_', ' ') || 'User';
  }

  get planType(): string {
    return this.subscription?.planType || this.currentUser?.subscription?.name?.toUpperCase() || 'No plan';
  }

  getInitials(name: string | null | undefined): string {
    if (!name) return 'TS';

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  updateProfile(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please enter a valid name and email.';
      return;
    }

    const payload = this.buildProfilePayload();
    this.saving = true;

    const request = this.profileId
      ? this.settingsService.updateProfile(this.profileId, payload)
      : this.settingsService.createProfile(payload);

    request.subscribe({
      next: (profile: any) => {
        this.profileId = String(profile?.id ?? this.profileId);
        this.profileMissing = false;
        localStorage.removeItem(this.getProfileMissingKey());
        this.storeProfile(profile, payload);
        this.syncCurrentUser(payload);
        this.successMessage = this.profileId
          ? 'Profile updated successfully.'
          : 'Profile saved successfully.';
        this.saving = false;
      },
      error: (err) => {
        console.error('PROFILE SAVE ERROR:', err);
        this.errorMessage = 'Profile could not be saved. Please try again.';
        this.saving = false;
      },
    });
  }

  deleteAccount(): void {
    if (!confirm('Delete account? This action cannot be undone.')) return;

    const deleteUser = () => {
      this.settingsService.deleteUser(this.userId).subscribe({
        next: () => {
          localStorage.clear();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('USER DELETE ERROR:', err);
          this.errorMessage = 'User could not be deleted.';
        },
      });
    };

    if (!this.profileId) {
      deleteUser();
      return;
    }

    this.settingsService.deleteProfile(this.profileId).subscribe({
      next: deleteUser,
      error: (err) => {
        console.error('PROFILE DELETE ERROR:', err);
        this.errorMessage = 'Profile could not be deleted.';
      },
    });
  }

  private loadProfile(): void {
    if (this.profileId || localStorage.getItem(this.getProfileMissingKey()) === 'true') {
      this.profileMissing = !this.profileId;
      this.loading = false;
      this.cd.detectChanges();
      return;
    }

    this.settingsService.getProfileByUserId(this.userId).subscribe({
      next: (res: any) => {
        this.profileId = String(res.id ?? '');
        this.storeProfile(res);
        this.form.patchValue({
          name: res.fullName || `${res.firstName ?? ''} ${res.lastName ?? ''}`.trim(),
          email: res.email ?? '',
        });
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        localStorage.setItem(this.getProfileMissingKey(), 'true');
        this.profileMissing = true;
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  private loadSubscription(): void {
    this.settingsService.getSubscriptionByUserId(this.userId).subscribe({
      next: (res: any) => {
        this.subscription = res;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('SUBSCRIPTION ERROR:', err);
        this.subscription = this.currentUser?.subscription
          ? {
              planType: this.currentUser.subscription.name.toUpperCase(),
              maxNodes: this.currentUser.subscription.maxNodes,
            }
          : null;
        this.cd.detectChanges();
      },
    });
  }

  private buildProfilePayload(): ProfilePayload {
    const fullName = (this.form.value.name || '').trim().split(/\s+/);

    return {
      firstName: fullName[0] || '',
      lastName: fullName.slice(1).join(' ') || '-',
      email: this.form.value.email,
      phoneNumber: '',
      profileImage: '',
      location: '',
    };
  }

  private syncCurrentUser(profile: ProfilePayload): void {
    if (!this.currentUser) return;

    this.currentUser.fullName = `${profile.firstName} ${profile.lastName}`.replace(' -', '').trim();
    this.currentUser.email = profile.email;
    this.authService.setCurrentUser(this.currentUser);
  }

  private getStoredProfile(): any | null {
    const raw = localStorage.getItem(this.getLocalProfileKey());
    return raw ? JSON.parse(raw) : null;
  }

  private storeProfile(profile: any, fallback?: ProfilePayload): void {
    const storedProfile = {
      id: profile?.id ?? this.profileId,
      userId: profile?.userId ?? Number(this.userId),
      firstName: profile?.firstName ?? fallback?.firstName ?? '',
      lastName: profile?.lastName ?? fallback?.lastName ?? '',
      fullName:
        profile?.fullName ??
        `${profile?.firstName ?? fallback?.firstName ?? ''} ${profile?.lastName ?? fallback?.lastName ?? ''}`.trim(),
      email: profile?.email ?? fallback?.email ?? '',
      phoneNumber: profile?.phoneNumber ?? fallback?.phoneNumber ?? '',
      profileImage: profile?.profileImage ?? fallback?.profileImage ?? '',
      location: profile?.location ?? fallback?.location ?? '',
    };

    localStorage.setItem(this.getLocalProfileKey(), JSON.stringify(storedProfile));
  }

  private getLocalProfileKey(): string {
    return `${this.LOCAL_PROFILE_KEY}_${this.userId}`;
  }

  private getProfileMissingKey(): string {
    return `${this.PROFILE_MISSING_KEY}_${this.userId}`;
  }
}
