import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../iam/services/auth.service';
import { WaterZoneService } from '../services/water-zone.service';
import { WaterManagerDashboard, WaterManagerFarmSummary } from '../model/water-zone.model';

@Component({
  selector: 'app-wm-producers',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './wm-producers.html',
  styleUrl: './wm-producers.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WmProducersComponent implements OnInit {
  dashboard: WaterManagerDashboard | null = null;
  loading = true;
  errorMessage = '';

  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private waterZoneService: WaterZoneService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.waterZoneService.getWMDashboard(user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Could not load producer data.';
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  get farms(): WaterManagerFarmSummary[] {
    return this.dashboard?.farms ?? [];
  }

  trackByFarmId(_: number, farm: WaterManagerFarmSummary): number {
    return farm.farmId;
  }
}
