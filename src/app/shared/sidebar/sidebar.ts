import { Component, OnInit } from '@angular/core';
import { CommonModule, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouterModule } from '@angular/router';           // ← necesario para routerLink y routerLinkActive
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
  usedNodes = 4;
  totalNodes = 10;

  constructor(private authService: AuthService) {}

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
        { label: 'Telemetry',     route: '/telemetry'     },
        { label: 'IoT Simulator', route: '/iot-simulator' },
        { label: 'Irrigation',   route: '/irrigation'   },
        { label: 'Alerts',       route: '/alerts'       },
        { label: 'Subscription', route: '/subscription' },
        { label: 'Settings',     route: '/settings'     },
      ];
      this.showPremiumCard = true;
    }
  }
}
