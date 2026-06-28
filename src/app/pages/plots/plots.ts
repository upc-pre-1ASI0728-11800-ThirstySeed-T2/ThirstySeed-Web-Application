import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { PlotService } from '../../pages/plots/services/plot.service';
import { Plot } from '../../pages/plots/model/plot.model';
import { AuthService } from '../../iam/services/auth.service';
import { SubscriptionService } from '../../iam/services/subscription.service';
import { FarmService } from '../farms/services/farm.service';
import { Farm } from '../farms/model/farm.model';

@Component({
  selector: 'app-plots',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, TranslateDirective],
  templateUrl: './plots.html',
  styleUrl: './plots.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlotsComponent implements OnInit {
  plots: Plot[] = [];
  loading = false;
  errorMessage = '';
  selectedFarmName = 'All farms';
  farms: Farm[] = [];
  maxNodes = 0;
  planType = '';
  userId = 0;
  editingPlotId: number | null = null;
  editForm = {
    name: '',
    farmId: null as number | null,
    location: '',
    extension: 0,
    status: 'Active',
    imageUrl: '',
  };

  private destroyRef = inject(DestroyRef);

  constructor(
    private plotService: PlotService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private farmService: FarmService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.userId = user.id;
    this.loadFarms(user.id);

    this.loading = true;

    this.subscriptionService.getByUserId(user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

    this.plotService.getPlotsByUser(userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (plots) => {
        this.plots = this.plotService.mergeWithStoredPlots(userId, plots);
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.plots = this.plotService.getStoredPlots(userId);
        this.errorMessage = this.plots.length > 0 ? '' : 'Could not load plots.';
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

  startEdit(plot: Plot): void {
    this.editingPlotId = plot.id;
    this.editForm = {
      name: plot.name,
      farmId: plot.farmId ?? this.findFarmIdByName(plot.location),
      location: plot.location,
      extension: plot.extension,
      status: plot.status || 'Active',
      imageUrl: plot.imageUrl || '',
    };
  }

  cancelEdit(): void {
    this.editingPlotId = null;
  }

  saveEdit(plot: Plot): void {
    const shouldSyncWithBackend = this.shouldSyncWithBackend(plot);
    const selectedFarm = this.farms.find((farm) => farm.id === Number(this.editForm.farmId));
    const farmName = selectedFarm?.name ?? plot.location;
    const updatedPlot: Plot = {
      ...plot,
      name: this.editForm.name.trim(),
      farmId: selectedFarm?.id ?? plot.farmId,
      location: farmName,
      extension: Number(this.editForm.extension) || 0,
      status: this.editForm.status,
      imageUrl: this.editForm.imageUrl.trim(),
      updatedAt: new Date().toISOString(),
    };

    this.plotService.updateStoredPlot(this.userId, updatedPlot);
    this.plots = this.plots.map((item) => (item.id === plot.id ? updatedPlot : item));
    this.editingPlotId = null;

    if (!shouldSyncWithBackend) {
      this.cd.detectChanges();
      return;
    }

    this.plotService.updatePlot(plot.id, {
      name: updatedPlot.name,
      location: updatedPlot.location,
      extension: updatedPlot.extension,
      imageUrl: updatedPlot.imageUrl,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ error: () => {} });
  }

  deletePlot(plot: Plot): void {
    if (!confirm(`Delete plot "${plot.name}"?`)) return;

    const shouldSyncWithBackend = this.shouldSyncWithBackend(plot);

    this.plotService.deleteStoredPlot(this.userId, plot.id);
    this.plots = this.plots.filter((item) => item.id !== plot.id);

    if (!shouldSyncWithBackend) {
      this.cd.detectChanges();
      return;
    }

    this.plotService.deletePlot(plot.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ error: () => {} });
  }

  openPlot(plot: Plot): void {
    this.router.navigate(['/telemetry'], {
      queryParams: {
        farmId: plot.farmId,
        plotId: plot.id,
      },
    });
  }

  private shouldSyncWithBackend(plot: Plot): boolean {
    return !this.isClientGeneratedPlot(plot);
  }

  private isClientGeneratedPlot(plot: Plot): boolean {
    return (
      plot.id >= 1_000_000_000_000 &&
      this.plotService.getStoredPlots(this.userId).some((storedPlot) => storedPlot.id === plot.id)
    );
  }

  private loadFarms(userId: number): void {
    const farmIds = this.farmService.getSavedFarmIds(userId);
    if (!farmIds.length) return;

    this.farmService.getFarmsByIds(farmIds).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (farms) => {
        this.farms = farms;
        this.cd.detectChanges();
      },
      error: () => {},
    });
  }

  private findFarmIdByName(name: string): number | null {
    return this.farms.find((farm) => farm.name === name)?.id ?? null;
  }

  trackById(_: number, item: {id: number}): number { return item.id; }
}
