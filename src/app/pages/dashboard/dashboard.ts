import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { DashboardService } from './services/dashboard.service';
import { AlertService } from './services/alert.service';
import { AlertCard, DashboardMetrics, PlotCard, WaterStressCard } from './model/dashboard.model';
import { AuthService } from '../../iam/services/auth.service';
import { BaseChartDirective } from 'ng2-charts';

import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterLink, TranslatePipe, TranslateDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  metrics: DashboardMetrics = {
    farms: 0,
    plots: 0,
    connectedNodes: 0,
    totalNodes: 0,
    criticalAlerts: 0,
  };

  loading = true;

  lineChartType: 'line' = 'line';

  lineChartData: ChartData<'line'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [],
        fill: true,
        tension: 0.4,
        borderWidth: 4,
        borderColor: '#047857',
        pointRadius: 5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#047857',
      },
    ],
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
        },
      },
    },
  };

  acknowledgingId: number | null = null;

  dismissedBanner = false;

  get planName(): string {
    return this.authService.getCurrentUser()?.subscription?.name ?? 'Plus';
  }

  get nodeUsagePct(): number {
    if (!this.metrics.totalNodes) return 0;
    return Math.round((this.metrics.connectedNodes / this.metrics.totalNodes) * 100);
  }

  get nodeUsageClass(): string {
    if (this.nodeUsagePct >= 90) return 'usage-critical';
    if (this.nodeUsagePct >= 70) return 'usage-warn';
    return 'usage-ok';
  }

  get criticalAlerts(): AlertCard[] {
    return this.latestAlerts.filter(a => a.status === 'CRITICAL');
  }

  get otherAlerts(): AlertCard[] {
    return this.latestAlerts.filter(a => a.status !== 'CRITICAL');
  }

  constructor(
    private dashboardService: DashboardService,
    private alertService: AlertService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadMetrics();
    this.loadPlotMonitoring();
    this.loadLatestAlerts();
    this.loadWaterStress();
    this.loadMoistureTrend();
  }

  loadMetrics(): void {
    this.dashboardService.getMetrics().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.loading = false;

        this.cd.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  loadPlotMonitoring(): void {
    this.dashboardService.getPlotMonitoring().subscribe({
      next: (plots) => {
        console.log('PLOT MONITORING', plots);

        this.plotMonitoring = plots;

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('PLOT ERROR', err);
      },
    });
  }

  loadLatestAlerts(): void {
    this.dashboardService.getLatestAlerts().subscribe({
      next: (alerts) => {
        this.latestAlerts = alerts;
        this.cd.detectChanges();
      },
    });
  }

  loadWaterStress(): void {
    this.dashboardService.getWaterStressCard().subscribe({
      next: (stress) => {
        this.waterStress = stress;
        this.cd.detectChanges();
      },
    });
  }

  loadMoistureTrend(): void {
    this.dashboardService.getMoistureTrend().subscribe({
      next: (trend) => {
        console.log('TREND', trend);

        this.moistureTrend = trend;

        this.lineChartData = {
          ...this.lineChartData,
          datasets: [
            {
              ...this.lineChartData.datasets[0],
              data: trend,
            },
          ],
        };

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('TREND ERROR', err);
      },
    });
  }

  acknowledgeAlert(alertId: number): void {
    if (this.acknowledgingId === alertId) return;
    this.acknowledgingId = alertId;
    this.alertService.acknowledgeAlert(alertId).subscribe({
      next: () => {
        this.latestAlerts = this.latestAlerts.filter((a) => a.id !== alertId);
        this.acknowledgingId = null;
        this.cd.detectChanges();
      },
      error: () => {
        this.acknowledgingId = null;
        this.cd.detectChanges();
      },
    });
  }

  plotMonitoring: PlotCard[] = [];

  latestAlerts: AlertCard[] = [];

  waterStress?: WaterStressCard;

  moistureTrend: number[] = [];
}
