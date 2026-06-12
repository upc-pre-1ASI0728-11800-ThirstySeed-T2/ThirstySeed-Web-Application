import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PlotService } from '../../pages/plots/services/plot.service';
import { Plot } from '../../pages/plots/model/plot.model';
import { AuthService } from '../../iam/services/auth.service';
import { HttpHeaders } from '@angular/common/http';
import { SubscriptionService } from '../../iam/services/subscription.service';

@Component({
  selector: 'app-plots',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './plots.html',
  styleUrl: './plots.css',
})
export class PlotsComponent implements OnInit {
  plots: Plot[] = [];
  loading = false;
  errorMessage = '';
  selectedFarmName = 'All farms';
  maxNodes = 0;
  planType = '';

  constructor(
    private plotService: PlotService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private subscriptionService: SubscriptionService,
  ) {}

  ngOnInit(): void {
    console.log('🟢 PlotsComponent INIT');

    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.loading = true;

    this.subscriptionService.getByUserId(user.id).subscribe({
      next: (sub) => {
        this.planType = sub.planType;
        this.maxNodes = sub.maxNodes;

        this.cd.detectChanges();

        this.loadPlots(user.id); // 👈 CLAVE
      },
      error: () => {
        this.planType = '—';
        this.maxNodes = 0;

        this.loadPlots(user.id); // 👈 CLAVE
      },
    });
  }

  loadPlots(userId: number): void {
    this.loading = true;

    this.plotService.getPlotsByUser(userId).subscribe({
      next: (plots) => {
        this.plots = plots;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Could not load plots.';
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  get totalPlots() {
    return this.plots.length;
  }

  get plotsWithNodes() {
    return this.plots.filter((p) => p.status === 'Online').length;
  }

  get plotsAtRisk() {
    return this.plots.filter((p) => p.status === 'Moderate' || p.status === 'High').length;
  }
  get nodesUsed(): number {
    return this.plots.length;
  }

  goToCreatePlot() {
    this.router.navigate(['/plots/create']);
  }
}
