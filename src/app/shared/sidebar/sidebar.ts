import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { AuthService } from '../../iam/services/auth.service';
import { PlotService } from '../../pages/plots/services/plot.service';
import { AlertService } from '../../pages/dashboard/services/alert.service';
import { SubscriptionService } from '../../iam/services/subscription.service';
import { LanguageSwitcherComponent } from '../language/language-switcher';

export interface MenuItem {
  label: string;
  route: string;
  translateKey: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    TranslatePipe, TranslateDirective,
    LanguageSwitcherComponent,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {

  menuItems: MenuItem[] = [];
  panelTitle = 'SIDEBAR.PRODUCER_PANEL';
  showPremiumCard = false;
  planName = 'Plan';
  usedNodes = 0;
  totalNodes = 0;
  pendingAlertCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private plotService: PlotService,
    private alertService: AlertService,
    private subscriptionService: SubscriptionService,
    private cd: ChangeDetectorRef,
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    if (user.roles?.includes('ROLE_WATER_MANAGER')) {
      this.panelTitle = 'SIDEBAR.WATER_MANAGER_PANEL';
      this.menuItems = [
        { label: 'Dashboard',       route: '/water-manager/dashboard',    translateKey: 'SIDEBAR.DASHBOARD'        },
        { label: 'Zones',           route: '/water-manager/zones/create', translateKey: 'SIDEBAR.ZONES'            },
        { label: 'Water Demand',    route: '/water-demand',               translateKey: 'SIDEBAR.WATER_DEMAND'     },
        { label: 'Critical Areas',  route: '/critical-areas',             translateKey: 'SIDEBAR.CRITICAL_AREAS'   },
        { label: 'Reports',         route: '/reports',                    translateKey: 'SIDEBAR.REPORTS'          },
        { label: 'Regional Alerts', route: '/regional-alerts',            translateKey: 'SIDEBAR.REGIONAL_ALERTS'  },
        { label: 'Support',         route: '/support',                    translateKey: 'SIDEBAR.SUPPORT'          },
        { label: 'Settings',        route: '/settings',                   translateKey: 'SIDEBAR.SETTINGS'         },
      ];
      this.showPremiumCard = false;

    } else {
      this.panelTitle = 'SIDEBAR.PRODUCER_PANEL';
      this.menuItems = [
        { label: 'Dashboard',       route: '/dashboard',     translateKey: 'SIDEBAR.DASHBOARD'       },
        { label: 'Farms',           route: '/farms',         translateKey: 'SIDEBAR.FARMS'           },
        { label: 'Plots',           route: '/plots',         translateKey: 'SIDEBAR.PLOTS'           },
        { label: 'Telemetry',       route: '/telemetry',     translateKey: 'SIDEBAR.TELEMETRY'       },
        { label: 'IoT Simulator',   route: '/iot-simulator', translateKey: 'SIDEBAR.IOT_SIMULATOR'   },
        { label: 'AI Crop Planner', route: '/digital-twin',  translateKey: 'SIDEBAR.AI_CROP_PLANNER' },
        { label: 'Support',         route: '/support',       translateKey: 'SIDEBAR.SUPPORT'         },
        { label: 'Profile',         route: '/profile',       translateKey: 'SIDEBAR.PROFILE'         },
        { label: 'Subscription',    route: '/profile-rol',   translateKey: 'SIDEBAR.SUBSCRIPTION'    },
        { label: 'Settings',        route: '/settings',      translateKey: 'SIDEBAR.SETTINGS'        },
      ];
      this.showPremiumCard = true;
      this.loadProducerPlanSummary(user.id);
      this.loadAlertCount(user.id);
    }
  }

  private loadProducerPlanSummary(userId: number): void {
    this.subscriptionService.getByUserId(userId).subscribe({
      next: (sub) => {
        this.planName = sub.planType?.includes('PREMIUM') ? 'Premium' : 'Plus';
        this.totalNodes = sub.maxNodes ?? 3;
        this.cd.markForCheck();
      },
      error: () => {
        const cached = localStorage.getItem(`subscription_${userId}`);
        if (cached) {
          try {
            const sub = JSON.parse(cached);
            this.planName = sub.planType?.includes('PREMIUM') ? 'Premium' : 'Plus';
            this.totalNodes = sub.maxNodes ?? 3;
          } catch { /* defaults */ }
        }
        this.cd.markForCheck();
      },
    });

    this.plotService.getPlotsByUser(userId).subscribe({
      next: (plots) => {
        this.usedNodes = this.plotService.mergeWithStoredPlots(userId, plots).length;
        this.cd.markForCheck();
      },
      error: () => {
        this.usedNodes = this.plotService.getStoredPlots(userId).length;
        this.cd.markForCheck();
      },
    });
  }

  private loadAlertCount(userId: number): void {
    this.plotService.getPlotsByUser(userId).pipe(
      catchError(() => of(this.plotService.getStoredPlots(userId))),
      switchMap((plots) => {
        if (!plots.length) return of([]);
        const requests = plots.map((p) =>
          this.alertService.getAlertsByPlot(p.id).pipe(catchError(() => of([]))),
        );
        return forkJoin(requests);
      }),
    ).subscribe({
      next: (allAlerts) => {
        const flat = (allAlerts as any[]).flat();
        this.pendingAlertCount = flat.filter(
          (a: any) => a.status !== 'ACKNOWLEDGED',
        ).length;
        this.cd.markForCheck();
      },
    });
  }
}
