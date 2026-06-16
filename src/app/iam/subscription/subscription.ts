import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionService } from '../services/subscription.service';

type InitialPlan = 'Plus' | 'Premium';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription.html',
  styleUrl: './subscription.css',
})
export class SubscriptionComponent {
  savingPlan: InitialPlan | null = null;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private subscriptionService: SubscriptionService,
  ) {}

  selectPlan(plan: InitialPlan): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.savingPlan = plan;
    this.errorMessage = '';

    const planType = plan === 'Plus' ? 'PLUS' : 'PREMIUM';
    const maxNodes = plan === 'Plus' ? 3 : 10;

    this.subscriptionService.createSubscription({
      userId: user.id,
      planType,
    }).subscribe({
      next: () => {
        user.subscription = {
          name: plan,
          price: plan === 'Plus' ? 19 : 39,
          maxNodes,
          features: plan === 'Plus'
            ? ['Basic plot monitoring', 'Water stress alerts', 'Sensor history access']
            : ['Predictive irrigation', 'Weather support', 'Priority alerts and reports'],
        };

        this.authService.setCurrentUser(user);
        this.router.navigate(['/dashboard']);
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
