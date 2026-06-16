import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.userId = user.id;
    this.isProducer = user.roles?.includes('ROLE_PRODUCER') ?? false;
    this.currentUrl = this.router.url;

    if (!this.isProducer) {
      this.subscriptionChecked = true;
      this.hasSubscription = true;
      return;
    }

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
    return (
      this.subscriptionChecked &&
      !this.hasSubscription &&
      this.isProducer &&
      this.currentUrl !== '/profile-rol'
    );
  }

  get showChecking(): boolean {
    return (
      !this.subscriptionChecked &&
      this.isProducer &&
      this.currentUrl !== '/profile-rol'
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
        this.cd.detectChanges();
      }
    }, 6000);

    this.subscriptionService.getByUserId(this.userId).subscribe({
      next: (sub) => {
        clearTimeout(this.fallbackTimer);
        if (this.destroyed) return;
        this.hasSubscription = sub?.active === true;
        this.subscriptionChecked = true;
        this.cd.detectChanges();
      },
      error: () => {
        clearTimeout(this.fallbackTimer);
        if (this.destroyed) return;
        this.hasSubscription = false;
        this.subscriptionChecked = true;
        this.cd.detectChanges();
      },
    });
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
}
