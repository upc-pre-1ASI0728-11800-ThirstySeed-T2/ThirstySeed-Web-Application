import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../iam/services/auth.service';
import { PlotService } from '../../pages/plots/services/plot.service';
import { AlertService } from '../../pages/dashboard/services/alert.service';
import { SubscriptionService } from '../../iam/services/subscription.service';
import { TelemetryService } from '../../pages/telemetry/services/telemetry.service';
import { LanguageSwitcherComponent } from '../language/language-switcher';

export interface MenuItem {
  label: string;
  route: string;
  translateKey: string;
}

const STRESS_ORDER = ['LOW', 'MEDIUM', 'MODERATE', 'HIGH', 'CRITICAL', 'EXTREME'];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    TranslatePipe,
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
  pendingRecommendationCount = 0;
  highestStressLevel = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private plotService: PlotService,
    private alertService: AlertService,
    private subscriptionService: SubscriptionService,
    private telemetryService: TelemetryService,
    private cd: ChangeDetectorRef,
  ) {}

  get alertBadgeSeverityClass(): string {
    if (this.highestStressLevel === 'EXTREME' || this.highestStressLevel === 'CRITICAL') return 'critical';
    if (this.highestStressLevel === 'HIGH') return 'high';
    if (this.highestStressLevel === 'MODERATE') return 'moderate';
    return '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    if (user.roles?.includes('ROLE_ADMIN')) {
      this.panelTitle = 'SIDEBAR.ADMIN_PANEL';
      this.menuItems = [
        { label: 'Dashboard', route: '/admin/dashboard', translateKey: 'SIDEBAR.DASHBOARD' },
        { label: 'Support',   route: '/support',         translateKey: 'SIDEBAR.SUPPORT'   },
        { label: 'Settings',  route: '/settings',        translateKey: 'SIDEBAR.SETTINGS'  },
      ];
      this.showPremiumCard = false;

    } else if (user.roles?.includes('ROLE_WATER_MANAGER')) {
      this.panelTitle = 'SIDEBAR.WATER_MANAGER_PANEL';
      this.menuItems = [
        { label: 'Dashboard',    route: '/water-manager/dashboard',    translateKey: 'SIDEBAR.DASHBOARD'    },
        { label: 'Zones',        route: '/water-manager/zones/create', translateKey: 'SIDEBAR.ZONES'        },
        { label: 'Producers',    route: '/water-manager/producers',    translateKey: 'SIDEBAR.PRODUCERS'    },
        { label: 'Distribution', route: '/water-manager/distribution', translateKey: 'SIDEBAR.DISTRIBUTION' },
        { label: 'Support',      route: '/support',                    translateKey: 'SIDEBAR.SUPPORT'      },
        { label: 'Settings',     route: '/settings',                   translateKey: 'SIDEBAR.SETTINGS'     },
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
      this.loadRecommendationCount(user.id);
    }
  }

  private loadProducerPlanSummary(userId: number): void {
    this.subscriptionService.getByUserId(userId).subscribe({
      next: (sub) => {
        this.planName = sub.planType?.includes('PREMIUM') ? 'Premium' : 'Plus';
        this.totalNodes = sub.maxNodes ?? 3;
        this.cd.markForCheck();
      },
      error: () => { this.cd.markForCheck(); },
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
        if (!plots.length) {
          return of({ alerts: [] as any[][], assessments: [] as any[][] });
        }
        return forkJoin({
          alerts: forkJoin(
            plots.map((p) => this.alertService.getAlertsByPlot(p.id).pipe(catchError(() => of([])))),
          ),
          assessments: forkJoin(
            plots.map((p) => this.telemetryService.getAssessmentsByPlot(p.id).pipe(catchError(() => of([])))),
          ),
        });
      }),
    ).subscribe({
      next: ({ alerts, assessments }) => {
        const flatAlerts = (alerts as any[][]).flat();
        this.pendingAlertCount = flatAlerts.filter((a: any) => a.status === 'PENDING').length;

        const flatAssessments = (assessments as any[][]).flat();
        this.highestStressLevel = this.resolveHighestStressLevel(
          flatAssessments.map((a: any) => String(a.stressLevel ?? '').toUpperCase()),
        );
        this.cd.markForCheck();
      },
    });
  }

  private loadRecommendationCount(userId: number): void {
    this.plotService.getPlotsByUser(userId).pipe(
      catchError(() => of(this.plotService.getStoredPlots(userId))),
      switchMap((plots) => {
        if (!plots.length) return of([]);
        return forkJoin(
          plots.map((p) => this.telemetryService.getRecommendationsByPlot(p.id).pipe(catchError(() => of([])))),
        );
      }),
    ).subscribe({
      next: (allRecs) => {
        const flat = (allRecs as any[]).flat();
        this.pendingRecommendationCount = flat.filter((r: any) => r.status === 'PENDING').length;
        this.cd.markForCheck();
      },
    });
  }

  private resolveHighestStressLevel(levels: string[]): string {
    return levels.reduce((highest, level) => {
      return STRESS_ORDER.indexOf(level) > STRESS_ORDER.indexOf(highest) ? level : highest;
    }, '');
  }
}
