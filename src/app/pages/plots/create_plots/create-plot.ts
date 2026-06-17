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
  selectedWaterDemand = 'MEDIUM';

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
  waterDemandOptions = ['LOW', 'MEDIUM', 'HIGH'];

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

    // SUBSCRIPTION
    this.subscriptionService.getByUserId(user.id).subscribe({
      next: (sub) => {
        this.planType = sub.planType;
        this.maxNodes = sub.maxNodes;
      }
    });

    // PLOTS USAGE
    this.plotService.getPlotsByUser(user.id).subscribe({
      next: (plots) => {
        this.currentNodes = plots.length;
      },
      error: () => this.currentNodes = 0
    });

    // FARMS
    const farmIds = this.farmService.getSavedFarmIds(user.id);

    if (farmIds.length > 0) {
      this.farmService.getFarmsByIds(farmIds).subscribe({
        next: (farms) => {
          this.farms = farms;

          if (farms.length > 0) {
            this.selectedFarmId = farms[0].id!;
          }
        }
      });
    }
  }

  // ======================
  // FARM NAME
  // ======================
  get selectedFarmName(): string {
    return this.farms.find(f => f.id === this.selectedFarmId)?.name ?? 'No farm selected';
  }

  // ======================
  // CREATE PLOT (FIX FINAL REAL)
  // ======================
  createPlot(): void {

    const user = this.authService.getCurrentUser();

    if (!user) {
      this.errorMessage = 'User not logged in';
      return;
    }

    if (!this.selectedFarmId) {
      this.errorMessage = 'Please select a farm';
      return;
    }

    if (this.currentNodes >= this.maxNodes) {
      this.errorMessage = `Plan ${this.planType} limit reached`;
      return;
    }

    // 🔥 FIX IMPORTANTE: payload alineado a backend real (evita 500)
    const payload = {
      cropName: this.selectedCrop || this.plotName,
      waterDemand: this.selectedWaterDemand,
      area: this.extension,
      coordinatesJson: JSON.stringify({
        name: this.plotName,
        farmName: this.selectedFarmName,
        soilType: this.selectedSoilType,
        irrigationSystem: this.selectedIrrigation,
        description: this.description,
        imageUrl: this.imageUrl || 'https://placehold.co/600x400',
      }),
    };

    console.log('👉 PAYLOAD FINAL:', payload);
    console.log('👉 FARM ID:', this.selectedFarmId);

    this.plotService.createPlotInFarm(this.selectedFarmId, payload)
      .subscribe({
        next: () => {
          this.successMessage = 'Plot created successfully';
          this.router.navigate(['/plots']);
        },
        error: (err) => {

          console.error('CREATE PLOT ERROR:', err);

          this.errorMessage =
            err?.error?.message || 'Failed to create plot';
        }
      });
  }

  // ======================
  // BACK
  // ======================
  goBack(): void {
    this.router.navigate(['/plots']);
  }
}
