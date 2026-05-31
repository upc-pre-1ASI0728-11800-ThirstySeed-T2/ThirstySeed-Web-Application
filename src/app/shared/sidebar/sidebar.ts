import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../iam/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit {
  menuItems: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return;
    }

    if (user.accountType === 'Agricultural Producer') {
      this.menuItems = [
        'Dashboard',
        'Farms',
        'Plots',
        'Telemetry',
        'Irrigation',
        'Alerts',
        'Subscription',
        'Settings',
      ];
    } else {
      this.menuItems = [
        'Dashboard',
        'Zones',
        'Water Demand',
        'Critical Areas',
        'Reports',
        'Regional Alerts',
        'Settings',
      ];
    }
  }
}
