import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FarmService } from '../services/farm.service';
import { AuthService } from '../../../iam/services/auth.service';
import { SubscriptionService } from '../../../iam/services/subscription.service';

@Component({
  selector: 'app-farm-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './farm-create.html',
  styleUrl: './farm-create.css',
})
export class FarmCreateComponent {
  farm = {
    name: '',
    totalArea: undefined as number | undefined,
    location: '',
    productionType: '',
    initialStatus: '',
    description: '',
  };

  loading = false;
  errorMessage = '';

  constructor(
    private farmService: FarmService,
    private authService: AuthService,
    private router: Router,
    private subscriptionService: SubscriptionService,
  ) {}

  createFarm(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    if (!this.farm.name) {
      this.errorMessage = 'Name is required.';
      return;
    }

    const ids = this.farmService.getSavedFarmIds();

    this.subscriptionService.getByUserId(user.id).subscribe({
      next: (subscription) => {
        if (ids.length >= subscription.maxFarms) {
          this.errorMessage = `Your ${subscription.planType} plan only allows ${subscription.maxFarms} farm(s).`;
          return;
        }

        this.loading = true;
        this.errorMessage = '';

        const payload = {
          name: this.farm.name,
          totalArea: this.farm.totalArea ?? 0,
          producerId: user.id,
        };

        this.farmService.createFarm(payload).subscribe({
          next: (farmId: number) => {
            this.farmService.saveFarmId(farmId);
            this.loading = false;
            this.router.navigate(['/farms']);
          },
          error: (err) => {
            this.errorMessage = 'Failed to create farm.';
            this.loading = false;
            console.error(err);
          },
        });
      },

      error: (err) => {
        console.error(err);
        this.errorMessage = 'Could not verify subscription.';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/farms']);
  }
}
