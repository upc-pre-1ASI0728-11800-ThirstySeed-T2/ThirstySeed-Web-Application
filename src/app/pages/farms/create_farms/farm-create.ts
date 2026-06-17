import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FarmService } from '../services/farm.service';
import { AuthService } from '../../../iam/services/auth.service';
import { SubscriptionService } from '../../../iam/services/subscription.service';
import { WaterZoneService } from '../../water-zones/services/water-zone.service';
import { WaterZone } from '../../water-zones/model/water-zone.model';

@Component({
  selector: 'app-farm-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './farm-create.html',
  styleUrl: './farm-create.css',
})
export class FarmCreateComponent implements OnInit {
  farm = {
    name: '',
    totalArea: undefined as number | undefined,
    location: '',
    productionType: '',
    initialStatus: '',
    mainCrop: '',
    description: '',
    waterManagementZoneId: undefined as number | undefined,
  };

  zones: WaterZone[] = [];
  selectedZone: WaterZone | null = null;
  loading = false;
  loadingZones = false;
  errorMessage = '';

  constructor(
    private farmService: FarmService,
    private authService: AuthService,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private waterZoneService: WaterZoneService,
  ) {}

  ngOnInit(): void {
    this.loadZones();
  }

  private loadZones(): void {
    this.loadingZones = true;
    this.waterZoneService.getAllZones().subscribe({
      next: (zones) => {
        this.zones = zones;
        this.loadingZones = false;
      },
      error: () => {
        this.zones = [];
        this.loadingZones = false;
      },
    });
  }

  onZoneChange(): void {
    this.selectedZone =
      this.zones.find((z) => z.id === this.farm.waterManagementZoneId) ?? null;
  }

  createFarm(): void {
    const user = this.authService.getCurrentUser();

    if (!user || !user.id) {
      this.errorMessage = 'Session expired. Please login again.';
      this.router.navigate(['/login']);
      return;
    }

    if (!this.farm.name) {
      this.errorMessage = 'Name is required.';
      return;
    }

    if (!this.farm.waterManagementZoneId) {
      this.errorMessage = 'Please select a water management zone.';
      return;
    }

    const ids = this.farmService.getSavedFarmIds(user.id);

    const doCreate = (maxFarms: number, planType: string) => {
      if (maxFarms > 0 && ids.length >= maxFarms) {
        this.errorMessage = `Your ${planType} plan only allows ${maxFarms} farm(s).`;
        return;
      }

      this.loading = true;
      this.errorMessage = '';

      const payload = {
        name: this.farm.name,
        totalArea: this.farm.totalArea ?? 0,
        location: this.farm.location,
        productionType: this.farm.productionType,
        initialStatus: this.farm.initialStatus,
        mainCrop: this.farm.mainCrop,
        description: this.farm.description,
        waterManagementZoneId: this.farm.waterManagementZoneId,
      };

      this.farmService.createFarm(payload).subscribe({
        next: (farmId: number) => {
          this.farmService.saveFarmId(user.id, farmId);
          this.loading = false;
          this.router.navigate(['/farms']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to create farm.';
          this.loading = false;
          console.error('CREATE FARM ERROR:', err);
        },
      });
    };

    this.subscriptionService.getByUserId(user.id).subscribe({
      next: (subscription) => {
        doCreate(subscription.maxFarms, subscription.planType);
      },
      error: () => {
        // Fallback: use locally cached subscription when GET endpoint returns 405
        const cached = localStorage.getItem(`subscription_${user.id}`);
        if (cached) {
          try {
            const sub = JSON.parse(cached);
            doCreate(sub.maxFarms ?? 0, sub.planType ?? '');
          } catch {
            doCreate(0, '');
          }
        } else {
          this.errorMessage = 'Could not verify your subscription. Please try again.';
        }
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/farms']);
  }
}
