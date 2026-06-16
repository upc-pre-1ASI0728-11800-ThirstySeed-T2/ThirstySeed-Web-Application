import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap, delay } from 'rxjs/operators';
import { AuthService } from '../../../iam/services/auth.service';
import { PlotService } from '../../plots/services/plot.service';
import { FarmService } from '../../farms/services/farm.service';
import { TelemetryService } from '../services/telemetry.service';
import { Plot } from '../../plots/model/plot.model';
import { Farm } from '../../farms/model/farm.model';
import {
  IrrigationRecommendation,
  TransmissionLogEntry,
} from '../model/recommendation.model';
import { User } from '../../../iam/services/auth.service';

@Component({
  selector: 'app-iot-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './iot-simulator.html',
  styleUrl: './iot-simulator.css',
})
export class IotSimulatorComponent implements OnInit {
  // ── Selectors ──────────────────────────────────────────────
  farms: Farm[] = [];
  plots: Plot[] = [];
  selectedFarmId: number | null = null;
  selectedPlotId: number | null = null;
  currentUser: User | null = null;

  // ── Simulator form ─────────────────────────────────────────
  soilMoisture = 35;
  temperature = 28;

  // ── UI state ───────────────────────────────────────────────
  isSimulating = false;
  isAccepting = false;
  errorMessage = '';
  successMessage = '';

  // ── AI results ─────────────────────────────────────────────
  latestRecommendation: IrrigationRecommendation | null = null;
  transmissionLog: TransmissionLogEntry[] = [];
  transmissionCount = 0;

  constructor(
    private authService: AuthService,
    private plotService: PlotService,
    private farmService: FarmService,
    private telemetryService: TelemetryService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.currentUser = user;

    const farmIds = this.farmService.getSavedFarmIds(user.id);
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
        this.cd.detectChanges();
      },
    });
  }

  onFarmChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedFarmId = value ? Number(value) : null;
    this.selectedPlotId = null;
    this.latestRecommendation = null;
  }

  onPlotChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedPlotId = value ? Number(value) : null;
    this.latestRecommendation = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  get filteredPlots(): Plot[] {
    if (!this.selectedFarmId) return this.plots;
    return this.plots.filter((p) => p.farmId === this.selectedFarmId);
  }

  get selectedPlot(): Plot | null {
    return this.plots.find((p) => p.id === this.selectedPlotId) ?? null;
  }

  get canTransmit(): boolean {
    return (
      !this.isSimulating &&
      this.selectedPlotId !== null &&
      this.soilMoisture >= 0 &&
      this.soilMoisture <= 100
    );
  }

  transmitReadings(): void {
    if (!this.canTransmit || !this.selectedPlotId) return;

    this.isSimulating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const plotId = this.selectedPlotId;

    // Step 1: POST soil moisture → Step 2: POST temperature → Step 3: wait 2.5s for AI → Step 4: GET recommendations
    this.telemetryService
      .sendReading({ plotId, value: this.soilMoisture, type: 'SOIL_MOISTURE' })
      .pipe(
        switchMap(() =>
          this.telemetryService.sendReading({
            plotId,
            value: this.temperature,
            type: 'TEMPERATURE',
          }),
        ),
        delay(2500),
        switchMap(() => this.telemetryService.getRecommendationsByPlot(plotId)),
      )
      .subscribe({
        next: (recommendations) => {
          this.latestRecommendation = recommendations[0] ?? null;
          this.transmissionCount++;
          this.addToLog();
          this.isSimulating = false;
          this.successMessage = this.latestRecommendation
            ? 'AI processed the data and generated a recommendation.'
            : 'Readings transmitted. No recommendation generated yet.';
          this.cd.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Transmission failed. Check your connection or plot assignment.';
          this.isSimulating = false;
          this.cd.detectChanges();
        },
      });
  }

  acceptRecommendation(): void {
    if (!this.latestRecommendation || this.isAccepting) return;

    this.isAccepting = true;

    this.telemetryService.acceptRecommendation(this.latestRecommendation.id).subscribe({
      next: () => {
        this.latestRecommendation!.status = 'ACCEPTED';
        this.isAccepting = false;
        this.successMessage = 'Recommendation accepted. Irrigation schedule created.';
        this.cd.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Could not accept the recommendation. Try again.';
        this.isAccepting = false;
        this.cd.detectChanges();
      },
    });
  }

  private addToLog(): void {
    const entry: TransmissionLogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      plotId: this.selectedPlotId!,
      soilMoisture: this.soilMoisture,
      temperature: this.temperature,
    };
    this.transmissionLog = [entry, ...this.transmissionLog].slice(0, 5);
  }

  get moistureLevel(): 'critical' | 'low' | 'optimal' | 'high' {
    if (this.soilMoisture < 20) return 'critical';
    if (this.soilMoisture < 40) return 'low';
    if (this.soilMoisture <= 70) return 'optimal';
    return 'high';
  }

  get moistureLevelLabel(): string {
    const map = { critical: 'Critical', low: 'Low', optimal: 'Optimal', high: 'High' };
    return map[this.moistureLevel];
  }
}
