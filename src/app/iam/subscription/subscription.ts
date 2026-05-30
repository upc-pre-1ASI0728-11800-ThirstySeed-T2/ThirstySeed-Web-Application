import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-subscription',
  standalone: true,
  templateUrl: './subscription.html',
  styleUrl: './subscription.css',
})
export class SubscriptionComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  selectPlan(plan: 'Plus' | 'Premium'): void {
    const user = this.authService.getCurrentUser();

    console.log('Current user:', user);

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.saveSubscription(user.id, plan);

    console.log('Users after update:', this.authService.getUsers());
  }

  goBack(): void {
    this.router.navigate(['/register']);
  }
}
