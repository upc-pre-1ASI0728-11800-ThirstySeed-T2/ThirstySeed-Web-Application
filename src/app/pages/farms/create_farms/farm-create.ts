import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  // ── Location mode ──────────────────────
  locationMode: 'gps' | 'manual' = 'gps';

  // ── GPS geolocation ────────────────────
  geoState: 'idle' | 'detecting' | 'done' | 'error' = 'idle';
  geoError = '';
  latitude: number | null = null;
  longitude: number | null = null;

  // ── Manual location ────────────────────
  manualCountry = '';
  manualCity = '';
  manualDetails = '';

  readonly countries: string[] = [
    'Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Australia',
    'Austria','Azerbaijan','Bangladesh','Belgium','Bolivia','Bosnia and Herzegovina',
    'Brazil','Bulgaria','Burkina Faso','Cambodia','Cameroon','Canada','Chile',
    'China','Colombia','Congo','Costa Rica','Croatia','Cuba','Czech Republic',
    'Denmark','Dominican Republic','Ecuador','Egypt','El Salvador','Ethiopia',
    'Finland','France','Georgia','Germany','Ghana','Greece','Guatemala','Haiti',
    'Honduras','Hungary','India','Indonesia','Iran','Iraq','Ireland','Israel',
    'Italy','Ivory Coast','Jamaica','Japan','Jordan','Kazakhstan','Kenya',
    'Kosovo','Kyrgyzstan','Laos','Lebanon','Libya','Lithuania','Madagascar',
    'Malawi','Malaysia','Mali','Mexico','Moldova','Mongolia','Morocco','Mozambique',
    'Myanmar','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria',
    'North Korea','Norway','Pakistan','Panama','Paraguay','Peru','Philippines',
    'Poland','Portugal','Romania','Russia','Rwanda','Saudi Arabia','Senegal',
    'Serbia','Sierra Leone','Slovakia','Somalia','South Africa','South Korea',
    'South Sudan','Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria',
    'Taiwan','Tajikistan','Tanzania','Thailand','Tunisia','Turkey','Turkmenistan',
    'Uganda','Ukraine','United Kingdom','United States','Uruguay','Uzbekistan',
    'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
  ];

  constructor(
    private farmService: FarmService,
    private authService: AuthService,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private waterZoneService: WaterZoneService,
    private cd: ChangeDetectorRef,
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
        this.cd.markForCheck();
      },
      error: () => {
        this.zones = [];
        this.loadingZones = false;
        this.cd.markForCheck();
      },
    });
  }

  onZoneChange(): void {
    this.selectedZone =
      this.zones.find((z) => z.id === this.farm.waterManagementZoneId) ?? null;
  }

  switchLocationMode(mode: 'gps' | 'manual'): void {
    this.locationMode = mode;
    if (mode === 'manual') {
      this.geoState = 'idle';
      this.geoError = '';
      this.latitude = null;
      this.longitude = null;
      this.farm.location = '';
      this.onManualLocationChange();
    } else {
      this.manualCountry = '';
      this.manualCity = '';
      this.manualDetails = '';
      this.farm.location = '';
    }
  }

  onManualLocationChange(): void {
    const parts = [
      this.manualDetails.trim(),
      this.manualCity.trim(),
      this.manualCountry.trim(),
    ].filter(Boolean);
    this.farm.location = parts.join(', ');
  }

  detectLocation(): void {
    if (!navigator.geolocation) {
      this.geoState = 'error';
      this.geoError = 'Geolocation is not supported by your browser.';
      return;
    }
    this.geoState = 'detecting';
    this.geoError = '';

    new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 }),
    )
      .then(async (pos) => {
        this.latitude = pos.coords.latitude;
        this.longitude = pos.coords.longitude;
        await this.reverseGeocode(this.latitude, this.longitude);
      })
      .catch((err: GeolocationPositionError) => {
        this.geoState = 'error';
        this.geoError =
          err.code === 1
            ? 'Location access denied. Please allow location in your browser.'
            : 'Could not determine location. Try again.';
        this.cd.markForCheck();
      });
  }

  private async reverseGeocode(lat: number, lon: number): Promise<void> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      const a = data.address ?? {};
      const parts = [
        a.city || a.town || a.village || a.county,
        a.state,
        a.country,
      ].filter(Boolean);
      this.farm.location = parts.length
        ? parts.join(', ')
        : (data.display_name ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    } catch {
      this.farm.location = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    }
    this.geoState = 'done';
    this.cd.markForCheck();
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

    if (!this.farm.totalArea || this.farm.totalArea <= 0) {
      this.errorMessage = 'Total area must be greater than 0.';
      return;
    }

    if (!this.farm.waterManagementZoneId) {
      this.errorMessage = 'Please select a water management zone.';
      return;
    }

    const doCreate = (maxFarms: number, planType: string, currentFarmCount: number) => {
      if (maxFarms > 0 && currentFarmCount >= maxFarms) {
        this.errorMessage = `Your ${planType} plan only allows ${maxFarms} farm(s).`;
        this.cd.markForCheck();
        return;
      }

      this.loading = true;
      this.errorMessage = '';

      const payload: Record<string, unknown> = {
        name: this.farm.name.trim(),
        totalArea: Number(this.farm.totalArea) || 0,
        waterManagementZoneId: Number(this.farm.waterManagementZoneId),
        location: this.farm.location.trim(),
        productionType: this.farm.productionType,
        initialStatus: this.farm.initialStatus,
        mainCrop: this.farm.mainCrop.trim(),
        description: this.farm.description.trim(),
      };
      if (this.latitude !== null)  payload['latitude']  = this.latitude;
      if (this.longitude !== null) payload['longitude'] = this.longitude;

      this.farmService.createFarm(payload).subscribe({
        next: (farmId: number) => {
          this.farmService.saveFarmId(user.id, farmId);
          this.loading = false;
          this.cd.markForCheck();
          this.router.navigate(['/farms']);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || err?.error?.detail || 'Failed to create farm.';
          this.loading = false;
          console.error('CREATE FARM ERROR:', err);
          console.error('CREATE FARM PAYLOAD:', payload);
          this.cd.markForCheck();
        },
      });
    };

    const verifyFarmUsageAndCreate = (maxFarms: number, planType: string) => {
      const ids = this.farmService.getSavedFarmIds(user.id);

      this.farmService.getFarmsByIds(ids).subscribe({
        next: (farms) => {
          this.farmService.replaceSavedFarmIds(user.id, farms.map((farm) => farm.id));
          doCreate(maxFarms, planType, farms.length);
        },
        error: () => doCreate(maxFarms, planType, 0),
      });
    };

    this.subscriptionService.getByUserId(user.id).subscribe({
      next: (subscription) => {
        verifyFarmUsageAndCreate(subscription.maxFarms, subscription.planType);
      },
      error: () => {
        verifyFarmUsageAndCreate(0, '');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/farms']);
  }

  trackById(_: number, item: {id: number}): number { return item.id; }
  trackByValue(_: number, item: string): string { return item; }
}
