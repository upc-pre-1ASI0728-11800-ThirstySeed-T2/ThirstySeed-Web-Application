import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FarmService } from '../farms/services/farm.service';
import { PlotService } from '../plots/services/plot.service';
import { AuthService } from '../../iam/services/auth.service';
import { Farm } from '../farms/model/farm.model';
import { Plot } from '../plots/model/plot.model';
import { TelemetryService } from './services/telemetry.service';
import { TelemetryReading } from './model/telemetry.model';
import { WaterStressAssessment } from './model/water-stress.model';
import { ChangeDetectorRef } from '@angular/core';
import { TelemetryNode } from './model/node.model';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartConfiguration, ChartData } from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-telemetry',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './telemetry.html',
  styleUrl: './telemetry.css',
})
export class TelemetryComponent implements OnInit {
  farms: Farm[] = [];
  plots: Plot[] = [];

  selectedFarmId: number | null = null;
  selectedPlotId: number | null = null;
  latestAssessment: WaterStressAssessment | null = null;

  filteredPlots: Plot[] = [];
  nodes: TelemetryNode[] = [];

  readings: TelemetryReading[] = [];

  constructor(
    private authService: AuthService,
    private farmService: FarmService,
    private plotService: PlotService,
    private telemetryService: TelemetryService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    console.log('USER', user);

    if (!user) return;

    const farmIds = this.farmService.getSavedFarmIds(user.id);

    console.log('FARM IDS', farmIds);

    if (farmIds.length > 0) {
      this.farmService.getFarmsByIds(farmIds).subscribe({
        next: (farms) => {
          this.farms = farms;
          setTimeout(() => {
            this.cd.detectChanges();
          });
        },
      });
    }

    this.plotService.getPlotsByUser(user.id).subscribe({
      next: (plots) => {
        this.plots = this.plotService.mergeWithStoredPlots(user.id, plots);
        this.filteredPlots = [];
        this.applyRouteSelection();
        setTimeout(() => {
          this.cd.detectChanges();
        });
      },
    });

    this.useMockTelemetry();
  }

  loadTelemetryCharts() {
    if (!this.selectedPlotId) return;

    this.telemetryService.getTelemetryHistory(this.selectedPlotId).subscribe({
      next: (history) => {
        if (!history.length) {
          this.useMockTelemetry();
          return;
        }

        const readings = history.map((h) => ({
          timestamp: new Date(h.recordedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          soilMoisture: h.soilMoisture,
          temperature: h.temperature,
          nodeStatus: 'Online',
        }));

        this.applyReadingsToCharts(readings);
        setTimeout(() => {
          this.cd.detectChanges();
        });
      },
      error: () => {
        this.useMockTelemetry();
      },
    });
  }

  onFarmChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.selectedFarmId = value ? Number(value) : null;

    this.filteredPlots = this.getPlotsForFarm(this.selectedFarmId);

    this.selectedPlotId = null;
  }

  onPlotChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedPlotId = value ? Number(value) : null;
    if (!this.selectedPlotId) {
      return;
    }
    this.loadSelectedPlotData();
  }

  get latestReading(): TelemetryReading | null {
    return this.readings[this.readings.length - 1] ?? null;
  }

  get averageMoisture(): number {
    if (!this.nodes.length) return 0;
    const total = this.nodes.reduce((sum, n) => sum + n.moisture, 0);
    return Math.round(total / this.nodes.length);
  }

  public lineChartType: 'line' = 'line';

  public moistureChartData: ChartData<'line'> = {
    labels: [],
    datasets: [],
  };

  public temperatureChartData: ChartData<'line'> = {
    labels: [],
    datasets: [],
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
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
          color: '#eef2ef',
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  private applyRouteSelection(): void {
    const farmId = Number(this.route.snapshot.queryParamMap.get('farmId'));
    const plotId = Number(this.route.snapshot.queryParamMap.get('plotId'));

    if (farmId) {
      this.selectedFarmId = farmId;
      this.filteredPlots = this.getPlotsForFarm(farmId);
    }

    if (plotId) {
      this.selectedPlotId = plotId;
      this.loadSelectedPlotData();
    }
  }

  private getPlotsForFarm(farmId: number | null): Plot[] {
    if (!farmId) return [];

    return this.plots.filter((plot) => !plot.farmId || plot.farmId === farmId);
  }

  private loadSelectedPlotData(): void {
    if (!this.selectedPlotId) return;

    this.loadTelemetryCharts();
    this.telemetryService.getAssessmentsByPlot(this.selectedPlotId).subscribe({
      next: (assessments) => {
        this.latestAssessment = assessments[0] ?? null;
        this.cd.detectChanges();
      },
      error: () => {
        this.latestAssessment = null;
      },
    });

    this.telemetryService.getNodesByPlot(this.selectedPlotId).subscribe({
      next: (nodes) => {
        this.nodes = nodes;
        this.cd.detectChanges();
      },
      error: () => {
        this.nodes = [];
      },
    });
  }

  private useMockTelemetry(): void {
    this.applyReadingsToCharts(this.telemetryService.getMockReadings());
  }

  private applyReadingsToCharts(readings: TelemetryReading[]): void {
    const labels = readings.map((reading) => reading.timestamp);

    this.readings = readings;
    this.moistureChartData = {
      labels,
      datasets: [
        {
          data: readings.map((reading) => reading.soilMoisture),
          borderColor: '#10754F',
          backgroundColor: 'rgba(16,117,79,0.12)',
          fill: 'origin',
          tension: 0.45,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    };

    this.temperatureChartData = {
      labels,
      datasets: [
        {
          data: readings.map((reading) => reading.temperature),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245,158,11,0.12)',
          fill: 'origin',
          tension: 0.45,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    };

    this.cd.detectChanges();
  }
}
