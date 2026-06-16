import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../shared/sidebar/sidebar';
import { AuthService } from '../iam/services/auth.service';
import { SubscriptionService } from '../iam/services/subscription.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent implements OnInit {
  subscriptionChecked = false;
  hasSubscription = false;
  isProducer = false;

  readonly plans = [
    {
      type: 'PLUS',
      name: 'Plus',
      price: 19,
      highlight: 'For small farms getting started.',
      features: ['Up to 3 farms', 'Up to 3 IoT nodes', 'Basic plot monitoring', 'Water stress alerts'],
    },
    {
      type: 'PREMIUM',
      name: 'Premium',
      price: 39,
      highlight: 'For advanced operations.',
      features: ['Up to 10 farms', 'Up to 10 IoT nodes', 'Predictive irrigation', 'Priority alerts & reports'],
    },
  ];

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.isProducer = user.roles?.includes('ROLE_PRODUCER') ?? false;

    if (!this.isProducer) {
      this.subscriptionChecked = true;
      this.hasSubscription = true;
      return;
    }

    this.subscriptionService.getByUserId(user.id).subscribe({
      next: (sub) => {
        this.hasSubscription = sub?.active ?? false;
        this.subscriptionChecked = true;
      },
      error: () => {
        this.hasSubscription = false;
        this.subscriptionChecked = true;
      },
    });
  }

  goToPlans(): void {
    this.router.navigate(['/profile-rol']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
