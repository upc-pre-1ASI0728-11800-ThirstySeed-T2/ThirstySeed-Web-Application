import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../iam/services/auth.service';
import { WaterZoneService } from '../services/water-zone.service';
import { WaterDistributionPlan, WaterDistributionItem } from '../model/water-zone.model';

@Component({
  selector: 'app-wm-distribution',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './wm-distribution.html',
  styleUrl: './wm-distribution.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WmDistributionComponent implements OnInit {
  plan: WaterDistributionPlan | null = null;
  loading = true;
  creating = false;
  savingItemId: number | null = null;
  errorMessage = '';
  successMessage = '';

  totalAvailableWater = 0;
  editAmounts: Record<number, number> = {};

  private userId = 0;
  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private waterZoneService: WaterZoneService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.userId = user.id;
    this.loadPlan();
  }

  loadPlan(): void {
    this.loading = true;
    this.waterZoneService.getDistributionPlan(this.userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (plan) => {
        this.plan = plan;
        this.initEditAmounts(plan.items);
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.plan = null;
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  createPlan(): void {
    if (!this.totalAvailableWater || this.totalAvailableWater <= 0) {
      this.errorMessage = 'Enter a valid water amount.';
      return;
    }
    this.errorMessage = '';
    this.creating = true;
    this.waterZoneService.createDistributionPlan(this.userId, this.totalAvailableWater)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (plan) => {
          this.plan = plan;
          this.initEditAmounts(plan.items);
          this.creating = false;
          this.successMessage = 'Distribution plan created.';
          this.cd.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Could not create the plan.';
          this.creating = false;
          this.cd.detectChanges();
        },
      });
  }

  saveItem(item: WaterDistributionItem): void {
    const amount = this.editAmounts[item.id];
    if (amount == null || amount < 0) return;
    this.savingItemId = item.id;
    this.successMessage = '';
    this.waterZoneService
      .updateDistributionItem(this.userId, this.plan!.id, item.id, amount)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.plan = updated;
          this.initEditAmounts(updated.items);
          this.savingItemId = null;
          this.successMessage = `Assignment for "${item.farmName}" saved.`;
          this.cd.detectChanges();
        },
        error: () => {
          this.savingItemId = null;
          this.errorMessage = 'Could not save the assignment.';
          this.cd.detectChanges();
        },
      });
  }

  private initEditAmounts(items: WaterDistributionItem[]): void {
    this.editAmounts = {};
    items.forEach((it) => (this.editAmounts[it.id] = it.assignedWaterAmount));
  }

  trackById(_: number, item: WaterDistributionItem): number {
    return item.id;
  }
}
