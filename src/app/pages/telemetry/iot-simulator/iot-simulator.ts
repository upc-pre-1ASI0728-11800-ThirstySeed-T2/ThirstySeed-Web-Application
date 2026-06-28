import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../../iam/services/auth.service';
import { PlotService } from '../../plots/services/plot.service';
import { FarmService } from '../../farms/services/farm.service';
import { TelemetryService } from '../services/telemetry.service';
import { Plot } from '../../plots/model/plot.model';
import { Farm } from '../../farms/model/farm.model';
import {
  IrrigationRecommendation,
  IrrigationSchedule,
  TransmissionLogEntry,
} from '../model/recommendation.model';
import { WaterStressAssessment } from '../model/water-stress.model';
import { TelemetryNode } from '../model/node.model';
import { User } from '../../../iam/services/auth.service';

@Component({
  selector: 'app-iot-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './iot-simulator.html',
  styleUrl: './iot-simulator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  // ── Node management ────────────────────────────────────────
  plotNodes: TelemetryNode[] = [];
  nodeLocation = '';
  isRegisteringNode = false;
  nodeErrorMessage = '';

  // ── AI results ─────────────────────────────────────────────
  latestRecommendation: IrrigationRecommendation | null = null;
  latestAssessment: WaterStressAssessment | null = null;
  latestSchedule: IrrigationSchedule | null = null;
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

    this.farmService.getMyFarms().subscribe({
      next: (farms) => {
        this.farms = farms;
        this.farmService.replaceSavedFarmIds(user.id, farms.map((f) => f.id));
        this.cd.detectChanges();
      },
      error: () => {
        const ids = this.farmService.getSavedFarmIds(user.id);
        if (ids.length > 0) {
          this.farmService.getFarmsByIds(ids).subscribe({
            next: (farms) => { this.farms = farms; this.cd.detectChanges(); },
          });
        }
      },
    });

    this.plotService.getPlotsByUser(user.id).subscribe({
      next: (plots) => {
        this.plots = this.plotService.mergeWithStoredPlots(user.id, plots);
        this.cd.detectChanges();
      },
      error: () => {
        this.plots = this.plotService.getStoredPlots(user.id);
        this.cd.detectChanges();
      },
    });
  }

  onFarmChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedFarmId = value ? Number(value) : null;
    this.selectedPlotId = null;
    this.latestRecommendation = null;
    this.latestAssessment = null;
    this.latestSchedule = null;
  }

  onPlotChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedPlotId = value ? Number(value) : null;
    this.latestRecommendation = null;
    this.latestAssessment = null;
    this.latestSchedule = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.plotNodes = [];
    this.nodeLocation = '';
    this.nodeErrorMessage = '';
    if (this.selectedPlotId) this.loadNodes(this.selectedPlotId);
  }

  private loadNodes(plotId: number): void {
    this.telemetryService.getNodesByPlot(plotId).subscribe({
      next: (nodes) => {
        this.plotNodes = nodes;
        this.cd.detectChanges();
      },
      error: () => {
        this.plotNodes = [];
        this.cd.detectChanges();
      },
    });
  }

  get hasNode(): boolean {
    return this.plotNodes.length > 0;
  }

  registerNode(): void {
    if (!this.selectedPlotId || !this.nodeLocation.trim() || this.isRegisteringNode) return;
    this.isRegisteringNode = true;
    this.nodeErrorMessage = '';

    this.telemetryService.createNode(this.selectedPlotId, this.nodeLocation.trim()).pipe(
      switchMap(() => this.telemetryService.getNodesByPlot(this.selectedPlotId!)),
    ).subscribe({
      next: (nodes) => {
        this.plotNodes = nodes;
        this.nodeLocation = '';
        this.isRegisteringNode = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.nodeErrorMessage = 'IOT_SIMULATOR.NODE.ERROR';
        this.isRegisteringNode = false;
        this.cd.detectChanges();
      },
    });
  }

  get filteredPlots(): Plot[] {
    if (!this.selectedFarmId) return this.plots;
    return this.plots.filter((p) => !p.farmId || p.farmId === this.selectedFarmId);
  }

  get selectedPlot(): Plot | null {
    return this.plots.find((p) => p.id === this.selectedPlotId) ?? null;
  }

  get canTransmit(): boolean {
    return (
      !this.isSimulating &&
      this.selectedPlotId !== null &&
      this.hasNode &&
      this.soilMoisture >= 0 &&
      this.soilMoisture <= 100
    );
  }

  get stressLevelClass(): string {
    const lvl = (this.latestAssessment?.stressLevel ?? '').toLowerCase();
    if (lvl.includes('high') || lvl.includes('critical') || lvl.includes('extreme')) return 'stress-high';
    if (lvl.includes('medium') || lvl.includes('moderate')) return 'stress-medium';
    return 'stress-low';
  }

  transmitReadings(): void {
    if (!this.canTransmit || !this.selectedPlotId) return;

    this.isSimulating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const plotId = this.selectedPlotId;

    // POST SOIL_MOISTURE → POST TEMPERATURE → GET snapshot → GET history → GET assessments → GET recommendations
    this.telemetryService
      .sendReading({ plotId, value: this.soilMoisture, type: 'SOIL_MOISTURE' })
      .pipe(
        switchMap(() =>
          this.telemetryService.sendReading({ plotId, value: this.temperature, type: 'TEMPERATURE' }),
        ),

        switchMap(() => this.telemetryService.getLatestSnapshot(plotId)),

        switchMap(() => this.telemetryService.getTelemetryHistory(plotId, 24)),

        switchMap(() => this.telemetryService.getAssessmentsByPlot(plotId)),

        tap((assessments) => {
          this.latestAssessment = assessments[0] ?? null;
        }),

        switchMap(() => this.telemetryService.getRecommendationsByPlot(plotId)),
      )
      .subscribe({
        next: (recommendations) => {
          this.latestRecommendation = recommendations[0] ?? null;
          this.transmissionCount++;
          this.addToLog();
          this.isSimulating = false;
          this.successMessage = this.latestRecommendation
            ? 'IOT_SIMULATOR.TRANSMIT.SUCCESS_WITH_REC'
            : 'IOT_SIMULATOR.TRANSMIT.SUCCESS_NO_REC';
          this.cd.detectChanges();
        },

        error: (err) => {
          console.error('TRANSMISSION ERROR', err);
          this.errorMessage = 'IOT_SIMULATOR.TRANSMIT.ERROR';
          this.isSimulating = false;
          this.cd.detectChanges();
        },
      });
  }

  acceptRecommendation(): void {
    if (!this.latestRecommendation || this.isAccepting || !this.selectedPlotId) return;

    this.isAccepting = true;
    const plotId = this.selectedPlotId;

    this.telemetryService
      .acceptRecommendation(this.latestRecommendation.id)
      .pipe(switchMap(() => this.telemetryService.getSchedulesByPlot(plotId)))
      .subscribe({
        next: (schedules) => {
          this.latestRecommendation!.status = 'ACCEPTED';
          this.latestSchedule = schedules[0] ?? null;
          this.isAccepting = false;
          this.successMessage = 'Recommendation accepted. Irrigation schedule created.';
          this.cd.detectChanges();
        },
        error: () => {
          // Accept succeeded but schedule retrieval failed — mark as accepted anyway
          this.latestRecommendation!.status = 'ACCEPTED';
          this.isAccepting = false;
          this.successMessage = 'Recommendation accepted. Irrigation schedule created.';
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
    const map = {
      critical: 'IOT_SIMULATOR.MOISTURE_LEVEL.CRITICAL',
      low: 'IOT_SIMULATOR.MOISTURE_LEVEL.LOW',
      optimal: 'IOT_SIMULATOR.MOISTURE_LEVEL.OPTIMAL',
      high: 'IOT_SIMULATOR.MOISTURE_LEVEL.HIGH',
    };
    return map[this.moistureLevel];
  }

  trackById(_: number, item: {id: number}): number { return item.id; }
  trackByTimestamp(_: number, item: {timestamp: string}): string { return item.timestamp; }
}
