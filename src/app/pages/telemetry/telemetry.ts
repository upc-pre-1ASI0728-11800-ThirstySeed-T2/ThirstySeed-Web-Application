import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-telemetry',
  standalone: true,
  imports: [CommonModule],
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
          this.cd.detectChanges();
        },
      });
    }

    this.plotService.getPlotsByUser(user.id).subscribe({
      next: (plots) => {
        this.plots = plots;
        this.filteredPlots = [];
        this.cd.detectChanges();
      },
    });

    this.readings = this.telemetryService.getMockReadings();
  }

  onFarmChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.selectedFarmId = value ? Number(value) : null;

    // TEMPORAL
    this.filteredPlots = [...this.plots];

    this.selectedPlotId = null;
  }

  onPlotChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedPlotId = value ? Number(value) : null;
    if (!this.selectedPlotId) {
      return;
    }
    this.telemetryService.getAssessmentsByPlot(this.selectedPlotId).subscribe({
      next: (assessments) => {
        console.log('ASSESSMENTS', assessments);

        if (assessments.length > 0) {
          this.latestAssessment = assessments[0];
        } else {
          this.latestAssessment = {
            id: crypto.randomUUID(),
            plotId: this.selectedPlotId!,
            readingValue: 34,
            stressLevel: 'MODERATE',
            weatherContext: {
              temperature: 28,
              humidity: 65,
              windSpeed: 12,
              precipitationProbability: 25,
            },
            evaluatedAt: new Date().toISOString(),
          };
        }

        this.cd.detectChanges();
      },
    });

    this.telemetryService.getNodesByPlot(this.selectedPlotId).subscribe({
      next: (nodes) => {
        console.log('NODES', nodes);

        if (nodes.length > 0) {
          this.nodes = nodes;
        } else {
          this.nodes = [
            {
              id: 1,
              plotId: this.selectedPlotId!,
              location: 'Node TS-01',
              moisture: 34,
              status: 'Online',
            },
          ];
        }

        this.cd.detectChanges();
      },
    });
  }

  get latestReading(): TelemetryReading | null {
    return this.readings[this.readings.length - 1] ?? null;
  }

  get averageMoisture(): number {
    if (!this.nodes.length) return 0;
    const total = this.nodes.reduce((sum, n) => sum + n.moisture, 0);
    return Math.round(total / this.nodes.length);
  }
}
