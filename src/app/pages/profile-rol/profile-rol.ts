import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../iam/services/auth.service';
import { Subscription, SubscriptionService } from '../../iam/services/subscription.service';

type PlanType = 'PRODUCER_PLUS' | 'PRODUCER_PREMIUM' | 'WATER_MANAGER_PLUS' | 'WATER_MANAGER_PREMIUM';

interface PlanOption {
  type: PlanType;
  name: 'Plus' | 'Premium';
  price: number;
  maxFarms: number;
  maxNodes: number;
  maxProducers: number;
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
  isProducer = false;
  currentSubscription: Subscription | null = null;
  loading = true;
  savingPlan: PlanType | null = null;
  successMessage = '';
  errorMessage = '';

  private readonly producerPlans: PlanOption[] = [
    {
      type: 'PRODUCER_PLUS',
      name: 'Plus',
      price: 19,
      maxFarms: 2,
      maxNodes: 3,
      maxProducers: 0,
      highlight: 'For small farms getting started with monitoring.',
      features: ['Up to 2 farms', 'Up to 3 IoT nodes', 'Basic plot monitoring', 'Water stress alerts'],
    },
    {
      type: 'PRODUCER_PREMIUM',
      name: 'Premium',
      price: 39,
      maxFarms: 10,
      maxNodes: 10,
      maxProducers: 0,
      highlight: 'For advanced operations with more plots and telemetry.',
      features: ['Up to 10 farms', 'Up to 10 IoT nodes', 'Predictive irrigation', 'Priority alerts and reports'],
    },
  ];

  private readonly waterManagerPlans: PlanOption[] = [
    {
      type: 'WATER_MANAGER_PLUS',
      name: 'Plus',
      price: 19,
      maxFarms: 2,
      maxNodes: 0,
      maxProducers: 1,
      highlight: 'For water managers supervising a small producer network.',
      features: ['Manage 1 producer', 'Up to 2 zones', 'Water distribution planning', 'Consumption reports'],
    },
    {
      type: 'WATER_MANAGER_PREMIUM',
      name: 'Premium',
      price: 39,
      maxFarms: 10,
      maxNodes: 0,
      maxProducers: 5,
      highlight: 'For regional water management at scale.',
      features: ['Manage up to 5 producers', 'Up to 10 zones', 'Predictive distribution', 'Critical area alerts & reports'],
    },
  ];

  get planOptions(): PlanOption[] {
    return this.isProducer ? this.producerPlans : this.waterManagerPlans;
  }

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
    this.isProducer = user.roles?.includes('ROLE_PRODUCER') ?? false;
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
          const target = this.isProducer ? '/dashboard' : '/water-manager/dashboard';
          this.router.navigate([target]);
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
      roleType: this.isProducer ? 'PRODUCER' : 'WATER_MANAGER',
      planType: plan.type,
      maxFarms: plan.maxFarms,
      maxNodes: plan.maxNodes,
      maxProducers: plan.maxProducers,
      validationCode: '',
      status: 'ACTIVE',
      active: true,
    };

    // Cache subscription locally so main-layout can verify it when the GET endpoint returns 405
    localStorage.setItem(`subscription_${this.userId}`, JSON.stringify(this.currentSubscription));

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
