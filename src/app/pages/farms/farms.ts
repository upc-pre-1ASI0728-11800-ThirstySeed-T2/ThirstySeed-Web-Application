import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FarmService } from './services/farm.service';
import { Farm } from './model/farm.model';
import { AuthService } from '../../iam/services/auth.service';
import { SubscriptionService } from '../../iam/services/subscription.service';
import { PlotService } from '../plots/services/plot.service';

@Component({
  selector: 'app-farms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './farms.html',
  styleUrl: './farms.css',
})
export class FarmsComponent implements OnInit {
  farms: Farm[] = [];
  allPlots: any[] = [];
  loading = false;
  errorMessage = '';
  subscriptionPlan: string | null = null;
  maxFarms: number | null = null;

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

    this.subscriptionService.getByUserId(user.id).subscribe({
      next: (sub) => {
        this.subscriptionPlan = sub.planType;
        this.maxFarms = sub.maxFarms;

        this.plotService.getPlotsByUser(user.id).subscribe({
          next: (plots) => {
            this.allPlots = plots;
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

    const ids = this.farmService.getSavedFarmIds(userId);

    if (!ids || ids.length === 0) {
      this.farms = [];
      this.loading = false;

      this.cd.detectChanges(); // 👈 CLAVE
      return;
    }

    this.farmService.getFarmsByIds(ids).subscribe({
      next: (farms) => {
        this.farms = farms;
        this.loading = false;

        this.cd.detectChanges(); // 👈 CLAVE
      },
      error: () => {
        this.errorMessage = 'Could not load farms.';
        this.loading = false;

        this.cd.detectChanges(); // 👈 CLAVE
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
}
