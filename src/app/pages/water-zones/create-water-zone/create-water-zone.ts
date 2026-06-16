import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../iam/services/auth.service';
import { WaterZoneService } from '../services/water-zone.service';
import { CreateWaterZoneRequest, WaterZone } from '../model/water-zone.model';

@Component({
  selector: 'app-create-water-zone',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-water-zone.html',
  styleUrl: './create-water-zone.css',
})
export class CreateWaterZoneComponent {
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form: CreateWaterZoneRequest = {
    waterManagerUserId: 0,
    name: '',
    location: '',
    description: '',
  };

  constructor(
    private authService: AuthService,
    private waterZoneService: WaterZoneService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.form.waterManagerUserId = user.id;
    }
  }

  cancel(): void {
    this.router.navigate(['/water-manager/dashboard']);
  }

  onSubmit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.waterZoneService.createZone(this.form).subscribe({
      next: (zone: WaterZone) => {
        this.waterZoneService.saveZoneId(user.id, zone.id);
        this.successMessage = `Zona "${zone.name}" creada correctamente.`;
        this.isLoading = false;
        this.cd.detectChanges();
        this.router.navigate(['/water-manager/dashboard']);
      },
      error: () => {
        this.errorMessage = 'No se pudo crear la zona. Inténtalo de nuevo.';
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }
}
