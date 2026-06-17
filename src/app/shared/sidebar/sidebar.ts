import { Component, OnInit } from '@angular/core';
import { CommonModule, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../iam/services/auth.service';

export interface MenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,     // ← registra routerLink, routerLinkActive, ngSwitch
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

  constructor(private authService: AuthService, private router: Router) {}

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
        { label: 'Dashboard',    route: '/dashboard'    },
        { label: 'Farms',        route: '/farms'        },
        { label: 'Plots',        route: '/plots'        },
        { label: 'Telemetry',    route: '/telemetry'    },
        { label: 'IoT Simulator', route: '/iot-simulator' },
        { label: 'Subscription', route: '/profile-rol'  },
        { label: 'Settings',     route: '/settings'     },
      ];
      this.showPremiumCard = true;
      this.loadProducerPlanSummary(user.id);
    }
  }

  private loadProducerPlanSummary(userId: number): void {
    const cachedSubscription = localStorage.getItem(`subscription_${userId}`);
    const subscription = cachedSubscription ? JSON.parse(cachedSubscription) : null;
    const planType = subscription?.planType || '';

    this.planName = planType.includes('PREMIUM') ? 'Premium' : 'Plus';
    this.totalNodes = subscription?.maxNodes ?? (planType.includes('PREMIUM') ? 10 : 3);

    const storedPlots = localStorage.getItem(`configuredPlots_${userId}`);
    this.usedNodes = storedPlots ? JSON.parse(storedPlots).length : 0;
  }
}
