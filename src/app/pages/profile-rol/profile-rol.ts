import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../iam/services/auth.service';
import { Subscription, SubscriptionService } from '../../iam/services/subscription.service';

type PlanType = 'PLUS' | 'PREMIUM';

interface PlanOption {
  type: PlanType;
  name: 'Plus' | 'Premium';
  price: number;
  maxFarms: number;
  maxNodes: number;
  highlight: string;
  features: string[];
}

@Component({
  selector: 'app-profile-rol',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-rol.html',
  styleUrl: './profile-rol.css',
})
export class ProfileRol implements OnInit {
  userId!: number;
  currentSubscription: Subscription | null = null;
  loading = true;
  savingPlan: PlanType | null = null;
  successMessage = '';
  errorMessage = '';

  planOptions: PlanOption[] = [
    {
      type: 'PLUS',
      name: 'Plus',
      price: 19,
      maxFarms: 3,
      maxNodes: 3,
      highlight: 'For small farms getting started with monitoring.',
      features: ['Up to 3 farms', 'Up to 3 IoT nodes', 'Basic plot monitoring', 'Water stress alerts'],
    },
    {
      type: 'PREMIUM',
      name: 'Premium',
      price: 39,
      maxFarms: 10,
      maxNodes: 10,
      highlight: 'For advanced operations with more plots and telemetry.',
      features: ['Up to 10 farms', 'Up to 10 IoT nodes', 'Predictive irrigation', 'Priority alerts and reports'],
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    const id = localStorage.getItem('userId') || String(user?.id ?? '');

    if (!id || !user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userId = Number(id);
    this.loadSubscription();
  }

  get currentPlanType(): string {
    return this.currentSubscription?.planType || 'NO PLAN';
  }

  get currentPlan(): PlanOption | undefined {
    return this.planOptions.find((plan) => plan.type === this.currentSubscription?.planType);
  }

  isCurrentPlan(plan: PlanOption): boolean {
    return this.currentSubscription?.planType === plan.type;
  }

  selectPlan(plan: PlanOption): void {
    if (this.isCurrentPlan(plan)) {
      this.successMessage = `${plan.name} is already your active plan.`;
      this.errorMessage = '';
      return;
    }

    this.savingPlan = plan.type;
    this.successMessage = '';
    this.errorMessage = '';

    const createPlan = () => {
      this.subscriptionService.createSubscription({
        userId: this.userId,
        planType: plan.type,
      }).subscribe({
        next: (subscription) => {
          this.applySubscription(subscription, plan);
          this.savingPlan = null;
          this.cd.detectChanges();
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('SUBSCRIPTION UPDATE ERROR:', err);
          this.errorMessage = 'The plan could not be changed. Please try again.';
          this.savingPlan = null;
          this.cd.detectChanges();
        },
      });
    };

    if (this.currentSubscription?.id) {
      this.subscriptionService.delete(this.currentSubscription.id).subscribe({
        next: createPlan,
        error: (err) => {
          console.error('SUBSCRIPTION DELETE BEFORE UPDATE ERROR:', err);
          this.errorMessage = 'The current plan could not be replaced.';
          this.savingPlan = null;
          this.cd.detectChanges();
        },
      });
      return;
    }

    createPlan();
  }

  private loadSubscription(): void {
    this.subscriptionService.getByUserId(this.userId).subscribe({
      next: (res) => {
        this.currentSubscription = res;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.currentSubscription = null;
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  private applySubscription(subscription: Subscription | null, plan: PlanOption): void {
    this.currentSubscription = subscription ?? {
      id: Date.now(),
      userId: this.userId,
      planType: plan.type,
      maxFarms: plan.maxFarms,
      maxNodes: plan.maxNodes,
      validationCode: '',
      status: 'ACTIVE',
      active: true,
    };

    const user = this.authService.getCurrentUser();
    if (!user) return;

    user.subscription = {
      name: plan.name,
      price: plan.price,
      maxNodes: plan.maxNodes,
      features: plan.features,
    };

    this.authService.setCurrentUser(user);
  }
}
