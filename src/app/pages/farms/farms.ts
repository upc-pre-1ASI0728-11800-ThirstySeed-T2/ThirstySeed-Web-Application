import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FarmService } from './services/farm.service';
import { Farm } from './model/farm.model';
import { AuthService } from '../../iam/services/auth.service';
import { SubscriptionService } from '../../iam/services/subscription.service';
import { PlotService } from '../plots/services/plot.service';
import { Plot } from '../plots/model/plot.model';

@Component({
  selector: 'app-farms',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './farms.html',
  styleUrl: './farms.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FarmsComponent implements OnInit {
  farms: Farm[] = [];
  allPlots: Plot[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  subscriptionPlan: string | null = null;
  maxFarms: number | null = null;

  private destroyRef = inject(DestroyRef);

  constructor(
    private farmService: FarmService,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private subscriptionService: SubscriptionService,
    private plotService: PlotService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.loading = true;

    this.subscriptionService.getByUserId(user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (sub) => {
        this.subscriptionPlan = sub.planType;
        this.maxFarms = sub.maxFarms;

        this.plotService.getPlotsByUser(user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (plots) => {
            this.allPlots = this.plotService.mergeWithStoredPlots(user.id, plots);
            this.loadFarms(user.id);
          },
          error: () => {
            this.allPlots = [];
            this.loadFarms(user.id);
          },
        });
      },
      error: () => {
        this.maxFarms = 0;
        this.subscriptionPlan = '—';
        this.loadFarms(user.id);
      },
    });
  }

  loadFarms(userId: number): void {
    this.loading = true;

    this.farmService.getMyFarms().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (farms) => {
        this.farms = farms;
        // Sync IDs to localStorage so other components can use them
        this.farmService.replaceSavedFarmIds(userId, farms.map((f) => f.id));
        this.errorMessage = '';
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        // Fallback: load from saved IDs when /producer/me fails
        const ids = this.farmService.getSavedFarmIds(userId);
        if (!ids.length) {
          this.farms = [];
          this.loading = false;
          this.cd.detectChanges();
          return;
        }
        this.farmService.getFarmsByIds(ids).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (farms) => {
            this.farms = farms;
            this.loading = false;
            this.cd.detectChanges();
          },
          error: () => {
            this.errorMessage = 'Could not load farms.';
            this.loading = false;
            this.cd.detectChanges();
          },
        });
      },
    });
  }

  get totalFarms() {
    return this.farms.length;
  }
  get totalActivePlots() {
    return 0;
  }
  get farmsWithNodes() {
    return this.farms.filter((f) => f.initialStatus === 'Active').length;
  }
  get farmsWithRisk() {
    return this.farms.filter((f) => f.initialStatus === 'Moderate' || f.initialStatus === 'High')
      .length;
  }

  getPlotsByFarm(farmId: number): number {
    return this.allPlots.filter((p) => p.farmId === farmId).length;
  }

  goToCreate(): void {
    this.router.navigate(['/farms/create']);
  }

  openFarm(farmId: number): void {
    this.router.navigate(['/farms', farmId]);
  }

  deleteFarm(farm: Farm): void {
    const plotsCount = this.getPlotsByFarm(farm.id);
    const message = plotsCount > 0
      ? `Delete farm "${farm.name}" and remove ${plotsCount} associated plot${plotsCount === 1 ? '' : 's'} from this app?`
      : `Delete farm "${farm.name}"?`;

    if (!confirm(message)) return;

    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.farmService.removeFarmId(user.id, farm.id);
    this.plotService.deleteStoredPlotsByFarm(user.id, farm.id);
    this.farms = this.farms.filter((item) => item.id !== farm.id);
    this.allPlots = this.allPlots.filter((plot) => plot.farmId !== farm.id);
    this.successMessage = 'Farm removed successfully.';
    this.cd.detectChanges();
  }

  get recentFarms(): Farm[] { return this.farms.slice(0, 3); }
  trackById(_: number, item: {id: number}): number { return item.id; }
}
