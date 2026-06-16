import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../iam/services/auth.service';
import { WaterZoneService } from '../services/water-zone.service';
import { WaterConsumptionSummary } from '../model/water-zone.model';

@Component({
  selector: 'app-water-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './water-manager-dashboard.html',
  styleUrl: './water-manager-dashboard.css',
})
export class WaterManagerDashboardComponent implements OnInit {
  consumption: WaterConsumptionSummary | null = null;
  isLoading = false;
  errorMessage = '';

  zoneIds: number[] = [];
  selectedZoneId: number | null = null;

  constructor(
    private authService: AuthService,
    private waterZoneService: WaterZoneService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.zoneIds = this.waterZoneService.getSavedZoneIds(user.id);

    if (this.zoneIds.length > 0) {
      this.selectedZoneId = this.zoneIds[0];
      this.loadConsumption(this.selectedZoneId);
    }
  }

  loadConsumption(zoneId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.waterZoneService.getWaterConsumption(zoneId).subscribe({
      next: (data) => {
        this.consumption = data;
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el consumo de la zona.';
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  onZoneChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedZoneId = value ? Number(value) : null;
    if (this.selectedZoneId) {
      this.loadConsumption(this.selectedZoneId);
    }
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get hasZone(): boolean {
    return this.zoneIds.length > 0;
  }

  goToCreateZone(): void {
    this.router.navigate(['/water-manager/zones/create']);
  }
}
