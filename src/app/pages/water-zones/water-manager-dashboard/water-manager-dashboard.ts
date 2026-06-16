import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../iam/services/auth.service';
import { WaterZoneService } from '../services/water-zone.service';
import { WaterConsumptionSummary, WaterManagerDashboard, WaterZone } from '../model/water-zone.model';

@Component({
  selector: 'app-water-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './water-manager-dashboard.html',
  styleUrl: './water-manager-dashboard.css',
})
export class WaterManagerDashboardComponent implements OnInit {
  zone: WaterZone | null = null;
  consumption: WaterConsumptionSummary | null = null;
  wmDashboard: WaterManagerDashboard | null = null;

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private waterZoneService: WaterZoneService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Fuente de verdad: API (no localStorage)
    this.waterZoneService.getZoneByWMUserId(user.id).subscribe({
      next: (zone) => {
        this.zone = zone;
        this.loadConsumption(zone.id);
        this.loadDashboard(user.id);
      },
      error: () => {
        // El WM aún no tiene zona registrada
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  loadConsumption(zoneId: number): void {
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

  loadDashboard(userId: number): void {
    this.waterZoneService.getWMDashboard(userId).subscribe({
      next: (dashboard) => {
        this.wmDashboard = dashboard;
        this.cd.detectChanges();
      },
    });
  }

  get hasZone(): boolean {
    return this.zone !== null;
  }

  get selectedZoneId(): number | null {
    return this.zone?.id ?? null;
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  goToCreateZone(): void {
    this.router.navigate(['/water-manager/zones/create']);
  }
}
