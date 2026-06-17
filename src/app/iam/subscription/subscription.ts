import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CreateSubscriptionRequest, SubscriptionService } from '../services/subscription.service';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription.html',
  styleUrl: './subscription.css',
})
export class SubscriptionComponent {
  savingPlan: 'Plus' | 'Premium' | null = null;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private subscriptionService: SubscriptionService,
  ) {}

  selectPlan(plan: 'Plus' | 'Premium'): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.savingPlan = plan;
    this.errorMessage = '';

    const isWaterManager = user.roles?.includes('ROLE_WATER_MANAGER') ?? false;

    let planType: CreateSubscriptionRequest['planType'];
    if (isWaterManager) {
      planType = plan === 'Plus' ? 'WATER_MANAGER_PLUS' : 'WATER_MANAGER_PREMIUM';
    } else {
      planType = plan === 'Plus' ? 'PRODUCER_PLUS' : 'PRODUCER_PREMIUM';
    }

    this.subscriptionService.createSubscription({ userId: user.id, planType }).subscribe({
      next: () => {
        const target = isWaterManager ? '/water-manager/dashboard' : '/dashboard';
        this.router.navigate([target]);
      },
      error: (err) => {
        console.error('INITIAL SUBSCRIPTION ERROR:', err);
        this.errorMessage = 'Unable to create subscription. Please try again.';
        this.savingPlan = null;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/register']);
  }
}
