import { Component, OnInit } from '@angular/core';
import { CommonModule, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../iam/services/auth.service';
import { PlotService } from '../../pages/plots/services/plot.service';
import { AlertService } from '../../pages/dashboard/services/alert.service';
import { SubscriptionService } from '../../iam/services/subscription.service';

export interface MenuItem {
  label: string;
  route: string;
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
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit {

  menuItems: MenuItem[] = [];
  panelTitle = 'Producer Panel';
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
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    if (user.roles?.includes('ROLE_WATER_MANAGER')) {
      this.panelTitle = 'Water Manager Panel';
      this.menuItems = [
        { label: 'Dashboard',       route: '/water-manager/dashboard'    },
        { label: 'Zones',           route: '/water-manager/zones/create' },
        { label: 'Water Demand',    route: '/water-demand'               },
        { label: 'Critical Areas',  route: '/critical-areas'             },
        { label: 'Reports',         route: '/reports'                    },
        { label: 'Regional Alerts', route: '/regional-alerts'            },
        { label: 'Settings',        route: '/settings'                   },
      ];
      this.showPremiumCard = false;

    } else {
      this.panelTitle = 'Producer Panel';
      this.menuItems = [
        { label: 'Dashboard',     route: '/dashboard'      },
        { label: 'Farms',         route: '/farms'          },
        { label: 'Plots',         route: '/plots'          },
        { label: 'Telemetry',     route: '/telemetry'      },
        { label: 'IoT Simulator', route: '/iot-simulator'  },
        { label: 'Digital Twin',  route: '/digital-twin'  },
        { label: 'Profile',       route: '/profile'        },
        { label: 'Subscription',  route: '/profile-rol'    },
        { label: 'Settings',      route: '/settings'       },
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
      },
    });

    this.plotService.getPlotsByUser(userId).subscribe({
      next: (plots) => {
        this.usedNodes = this.plotService.mergeWithStoredPlots(userId, plots).length;
      },
      error: () => {
        this.usedNodes = this.plotService.getStoredPlots(userId).length;
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
      },
    });
  }
}
