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
  isWaterManager = false;
  savingPlan: 'Plus' | 'Premium' | null = null;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private subscriptionService: SubscriptionService,
  ) {
    const user = this.authService.getCurrentUser();
    this.isWaterManager = user?.roles?.includes('ROLE_WATER_MANAGER') ?? false;
  }

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
      next: (subscription) => {
        user.subscription = {
          name: plan,
          price: plan === 'Plus' ? 19 : 39,
          maxNodes: subscription?.maxNodes ?? (plan === 'Plus' ? 3 : 10),
          features: plan === 'Plus'
            ? ['Up to 3 farms', 'Up to 3 IoT nodes', 'Basic plot monitoring', 'Water stress alerts']
            : ['Up to 10 farms', 'Up to 10 IoT nodes', 'Predictive irrigation', 'Priority alerts and reports'],
        };
        this.authService.setCurrentUser(user);
        this.router.navigate(['/profile']);
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
