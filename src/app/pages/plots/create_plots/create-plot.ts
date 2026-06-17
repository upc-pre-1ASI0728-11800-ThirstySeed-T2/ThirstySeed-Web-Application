import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PlotService } from '../services/plot.service';
import { AuthService } from '../../../iam/services/auth.service';
import { SubscriptionService } from '../../../iam/services/subscription.service';
import { FarmService } from '../../farms/services/farm.service';
import { Farm } from '../../farms/model/farm.model';

@Component({
  selector: 'app-create-plot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-plot.html',
  styleUrl: './create-plot.css',
})
export class CreatePlotComponent implements OnInit {

  // ======================
  // FORM DATA
  // ======================
  plotName = '';
  extension = 0;
  status = 'Active';
  description = '';
  imageUrl = '';

  selectedCrop = '';
  selectedSoilType = '';
  selectedIrrigation = '';
  selectedWaterDemand: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';

  selectedFarmId: number | null = null;

  // NODE (UI)
  selectedNode = 'Assign later';
  nodeOptions: string[] = ['Assign later'];

  // ======================
  // PLAN
  // ======================
  planType = '';
  maxNodes = 0;
  currentNodes = 0;

  // ======================
  // DATA
  // ======================
  farms: Farm[] = [];

  // ======================
  // UI
  // ======================
  errorMessage = '';
  successMessage = '';

  cropOptions = ['Corn', 'Rice', 'Coffee', 'Potato', 'Wheat', 'Avocado'];
  soilTypes = ['Clay', 'Loam', 'Sand', 'Silt', 'Mixed'];
  irrigationSystems = ['Drip', 'Sprinkler', 'Surface', 'Manual'];
  waterDemandOptions: Array<'HIGH' | 'MODERATE' | 'LOW'> = ['HIGH', 'MODERATE', 'LOW'];

  constructor(
    private plotService: PlotService,
    private authService: AuthService,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private farmService: FarmService,
  ) {}

  // ======================
  // INIT
  // ======================
  ngOnInit(): void {

    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.subscriptionService.getByUserId(user.id).subscribe({
      next: (sub) => {
        this.planType = sub.planType;
        this.maxNodes = sub.maxNodes;
      },
      error: () => {
        const cached = localStorage.getItem(`subscription_${user.id}`);
        if (cached) {
          try {
            const sub = JSON.parse(cached);
            this.planType = sub.planType ?? '';
            this.maxNodes = sub.maxNodes ?? 0;
          } catch { /* leave defaults */ }
        }
      },
    });

    this.plotService.getPlotsByUser(user.id).subscribe({
      next: (plots) => {
        this.currentNodes = this.plotService.mergeWithStoredPlots(user.id, plots).length;
      },
      error: () => {
        this.currentNodes = this.plotService.getStoredPlots(user.id).length;
      },
    });

    const farmIds = this.farmService.getSavedFarmIds(user.id);

    if (farmIds.length > 0) {
      this.farmService.getFarmsByIds(farmIds).subscribe({
        next: (farms) => {
          this.farms = farms;
          if (farms.length > 0) this.selectedFarmId = farms[0].id!;
        },
        error: () => this.loadAllFarms(user.id),
      });
    } else {
      this.loadAllFarms(user.id);
    }
  }

  private loadAllFarms(userId: number): void {
    this.farmService.getAllFarms().subscribe({
      next: (farms) => {
        this.farms = farms.filter(f => f.producerId === userId);
        if (this.farms.length > 0) this.selectedFarmId = this.farms[0].id!;
      },
      error: () => { /* no farms available */ },
    });
  }

  get selectedFarmName(): string {
    return this.farms.find(f => f.id === this.selectedFarmId)?.name ?? 'No farm selected';
  }

  createPlot(): void {

    const user = this.authService.getCurrentUser();

    if (!user) {
      this.errorMessage = 'User not logged in';
      return;
    }

    if (!this.plotName.trim()) {
      this.errorMessage = 'Plot name is required';
      return;
    }

    if (!this.selectedFarmId) {
      this.errorMessage = 'Please select a farm';
      return;
    }

    if (this.extension <= 0) {
      this.errorMessage = 'Area must be greater than 0';
      return;
    }

    if (this.maxNodes > 0 && this.currentNodes >= this.maxNodes) {
      this.errorMessage = `Plan ${this.planType} limit reached (${this.currentNodes}/${this.maxNodes})`;
      return;
    }

    const payload = {
      name: this.plotName,
      cropName: this.selectedCrop || this.plotName,
      waterDemand: this.selectedWaterDemand,
      area: this.extension,
      soilType: this.selectedSoilType || undefined,
      irrigationSystem: this.selectedIrrigation || undefined,
      description: this.description || undefined,
      coordinatesJson: null,
    };

    this.plotService.createPlotInFarm(this.selectedFarmId, payload).subscribe({
      next: () => {
        this.plotService.getPlotsByUser(user.id).subscribe({
          next: (backendPlots) => {
            const now = new Date().toISOString();
            const latestPlot = backendPlots.length > 0 ? backendPlots[backendPlots.length - 1] : null;

            this.plotService.saveStoredPlot(user.id, {
              id: latestPlot?.id ?? Date.now(),
              userId: user.id,
              farmId: this.selectedFarmId!,
              name: this.plotName,
              location: this.selectedFarmName,
              extension: this.extension,
              status: this.status,
              imageUrl: this.imageUrl || 'https://placehold.co/600x400',
              createdAt: now,
              updatedAt: now,
            });

            this.successMessage = 'Plot created successfully';
            this.router.navigate(['/plots']);
          },
        });
      },
      error: (err) => {
        console.error('CREATE PLOT ERROR:', err);
        this.errorMessage = err?.error?.message || 'Failed to create plot';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/plots']);
  }
}
