import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlotService } from '../services/plot.service';
import { AuthService } from '../../../iam/services/auth.service';
import { Router } from '@angular/router';
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
  plotName = '';
  extension = 0;
  status = 'Active';
  imageUrl = '';

  errorMessage = '';
  successMessage = '';

  planType = '';
  maxNodes = 0;
  currentNodes = 0;

  farms: Farm[] = [];
  selectedFarmId: number | null = null;

  constructor(
    private plotService: PlotService,
    private authService: AuthService,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private farmService: FarmService,
  ) {}

  cropOptions = ['Corn', 'Rice', 'Coffee', 'Potato', 'Wheat', 'Avocado'];
  selectedCrop = '';

  soilTypes = ['Clay', 'Loam', 'Sand', 'Silt', 'Mixed'];
  selectedSoilType = '';

  irrigationSystems = ['Drip', 'Sprinkler', 'Surface', 'Manual'];
  selectedIrrigation = '';

  nodeOptions = ['Assign later'];
  selectedNode = 'Assign later';

  description = '';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    if (!user) return;

    setTimeout(() => {
      this.subscriptionService.getByUserId(user.id).subscribe((sub) => {
        this.planType = sub.planType;
        this.maxNodes = sub.maxNodes;

        this.plotService.getPlotsByUser(user.id).subscribe((plots) => {
          this.currentNodes = plots.length;
        });
      });
    });

    const farmIds = this.farmService.getSavedFarmIds(user.id);

    if (farmIds.length > 0) {
      this.farmService.getFarmsByIds(farmIds).subscribe({
        next: (farms) => {
          this.farms = farms;

          if (farms.length > 0) {
            this.selectedFarmId = farms[0].id;
          }
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/plots']);
  }

  createPlot() {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    this.subscriptionService.getByUserId(user.id).subscribe({
      next: (subscription) => {
        this.plotService.getPlotsByUser(user.id).subscribe({
          next: (plots) => {
            if (plots.length >= subscription.maxNodes) {
              this.errorMessage = `Your ${subscription.planType} plan only allows ${subscription.maxNodes} nodes.`;

              return;
            }

            const selectedFarm = this.farms.find((farm) => farm.id === this.selectedFarmId);

            const newPlot = {
              userId: user.id,
              farmId: this.selectedFarmId ?? undefined,
              name: this.plotName,
              location: selectedFarm?.name ?? '',
              extension: this.extension,
              imageUrl: this.imageUrl || 'https://placehold.co/600x400',
            };

            console.log('Farm seleccionada:', selectedFarm);
            console.log('PLOT PAYLOAD');
            console.log(JSON.stringify(newPlot, null, 2));

            this.plotService.createPlot(newPlot).subscribe({
              next: (createdPlot: any) => {
                console.log('✅ CREATED PLOT:', createdPlot);

                const plotId = createdPlot.id;

                this.plotService.savePlotId(user.id, plotId);

                this.successMessage = 'Plot created successfully!';

                this.router.navigate(['/plots']);
              },
              error: (err) => {
                this.errorMessage = 'Failed to create plot.';
                console.error(err);
              },
            });
          },
          error: (err) => {
            console.error(err);
            this.errorMessage = 'Could not verify current usage.';
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Could not verify subscription.';
      },
    });
  }

  get selectedFarmName(): string {
    return this.farms.find((f) => f.id === this.selectedFarmId)?.name ?? 'No farm';
  }
}
