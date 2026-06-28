import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, filter } from 'rxjs';
import { SidebarComponent } from '../shared/sidebar/sidebar';
import { AuthService } from '../iam/services/auth.service';
import { SubscriptionService } from '../iam/services/subscription.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  subscriptionChecked = false;
  hasSubscription = false;
  isProducer = false;
  currentUrl = '';

  private userId = 0;
  private destroyed = false;
  private fallbackTimer?: ReturnType<typeof setTimeout>;
  private destroy$ = new Subject<void>();

  private readonly producerPlans = [
    {
      type: 'PRODUCER_PLUS',
      name: 'Plus',
      price: 19,
      highlight: 'For small farms getting started.',
      features: ['Up to 2 farms', 'Up to 3 IoT nodes', 'Basic plot monitoring', 'Water stress alerts'],
    },
    {
      type: 'PRODUCER_PREMIUM',
      name: 'Premium',
      price: 39,
      highlight: 'For advanced operations.',
      features: ['Up to 10 farms', 'Up to 10 IoT nodes', 'Predictive irrigation', 'Priority alerts & reports'],
    },
  ];

  private readonly waterManagerPlans = [
    {
      type: 'WATER_MANAGER_PLUS',
      name: 'Plus',
      price: 19,
      highlight: 'For managers supervising a small producer network.',
      features: ['Manage 1 producer', 'Up to 2 zones', 'Water distribution planning', 'Consumption reports'],
    },
    {
      type: 'WATER_MANAGER_PREMIUM',
      name: 'Premium',
      price: 39,
      highlight: 'For regional water management at scale.',
      features: ['Manage up to 5 producers', 'Up to 10 zones', 'Predictive distribution', 'Critical area alerts'],
    },
  ];

  get plans() {
    return this.isProducer ? this.producerPlans : this.waterManagerPlans;
  }

  get gateSubtitle(): string {
    return this.isProducer
      ? 'You need an active subscription to access IoT monitoring, telemetry data and AI irrigation recommendations.'
      : 'You need an active subscription to manage water zones, distribution plans and monitor your producer network.';
  }

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.userId = user.id;
    this.isProducer = user.roles?.includes('ROLE_PRODUCER') ?? false;
    this.currentUrl = this.router.url;

    // Re-check when leaving /profile-rol (user just picked a plan)
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntil(this.destroy$),
    ).subscribe((e) => {
      const prev = this.currentUrl;
      this.currentUrl = e.urlAfterRedirects;

      if (prev === '/profile-rol' && this.currentUrl !== '/profile-rol') {
        this.checkSubscription();
      }

      this.cd.detectChanges();
    });

    this.checkSubscription();
  }

  get showGate(): boolean {
    return false;
  }

  get showChecking(): boolean {
    return (
      !this.subscriptionChecked &&
      this.currentUrl !== '/profile-rol' &&
      this.currentUrl !== '/profile'
    );
  }

  private checkSubscription(): void {
    this.subscriptionChecked = false;
    clearTimeout(this.fallbackTimer);

    // Native timeout as hard fallback — fires regardless of Observable state
    this.fallbackTimer = setTimeout(() => {
      if (!this.destroyed && !this.subscriptionChecked) {
        this.hasSubscription = false;
        this.subscriptionChecked = true;
        this.redirectToInitialSubscriptionIfNeeded();
        this.cd.detectChanges();
      }
    }, 6000);

    this.subscriptionService.getByUserId(this.userId).subscribe({
      next: (sub) => {
        clearTimeout(this.fallbackTimer);
        if (this.destroyed) return;
        this.hasSubscription = sub?.active === true;
        this.subscriptionChecked = true;
        this.redirectToInitialSubscriptionIfNeeded();
        this.cd.detectChanges();
      },
      error: () => {
        clearTimeout(this.fallbackTimer);
        if (this.destroyed) return;
        this.hasSubscription = false;
        this.subscriptionChecked = true;
        this.redirectToInitialSubscriptionIfNeeded();
        this.cd.detectChanges();
      },
    });
  }

  private redirectToInitialSubscriptionIfNeeded(): void {
    if (
      !this.hasSubscription &&
      this.currentUrl !== '/profile-rol' &&
      this.currentUrl !== '/profile' &&
      this.currentUrl !== '/subscription'
    ) {
      this.router.navigate(['/subscription']);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    clearTimeout(this.fallbackTimer);
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToPlans(): void {
    this.router.navigate(['/profile-rol']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  trackByPlanName(_: number, plan: {name: string}): string { return plan.name; }
  trackByValue(_: number, item: string): string { return item; }
}
