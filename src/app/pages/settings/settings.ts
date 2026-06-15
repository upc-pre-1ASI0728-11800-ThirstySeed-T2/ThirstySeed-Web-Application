import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent implements OnInit {

  form!: FormGroup;

  userId: string = '';
  profileId: string = '';

  loading = true;
  subscription: any;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.userId = localStorage.getItem('userId') || '';

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.form = this.fb.group({
      name: [''],
      username: ['']
    });

    this.settingsService.getProfileByUserId(this.userId)
      .subscribe({
        next: (res: any) => {

          this.profileId = res.id;

          this.form.patchValue({
            name: `${res.firstName ?? ''} ${res.lastName ?? ''}`.trim(),
            username: res.email ?? ''
          });

          this.loading = false;
        },
        error: (err) => {
          console.error('ERROR API:', err);
          this.loading = false;
        }
      });

      this.settingsService.getSubscriptionByUserId(this.userId)
  .subscribe({
    next: (res: any) => {
      this.subscription = res;
    },
    error: (err) => {
      console.error('SUBSCRIPTION ERROR:', err);
    }
  });
  }

  // 🧠 AVATAR INITIALS SAFE
  getInitials(name: string | null | undefined): string {
    if (!name) return '';

    return name
      .split(' ')
      .filter(Boolean)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }

  // ✏️ UPDATE
  updateProfile() {

    const fullName = (this.form.value.name || '').trim().split(' ');

    const payload = {
      firstName: fullName[0] || '',
      lastName: fullName.slice(1).join(' ') || '',
      email: this.form.value.username
    };

    this.settingsService.updateProfile(this.profileId, payload)
      .subscribe({
        next: () => alert('Perfil actualizado'),
        error: (err) => console.error(err)
      });
  }

  // 🗑️ DELETE (CORRECT FLOW)
  deleteAccount() {

    if (!confirm('¿Eliminar cuenta?')) return;

    // 1. profile
    this.settingsService.deleteProfile(this.profileId)
      .subscribe({
        next: () => {

          // 2. user
          this.settingsService.deleteUser(this.userId)
            .subscribe({
              next: () => {
                localStorage.clear();
                this.router.navigate(['/login']);
              },
              error: (err) => {
                console.error('ERROR USER DELETE:', err);
              }
            });
        },
        error: (err) => {
          console.error('ERROR PROFILE DELETE:', err);
        }
      });
  }
}