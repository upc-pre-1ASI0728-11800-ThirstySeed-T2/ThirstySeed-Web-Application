import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { switchMap, tap, delay } from 'rxjs/operators';
import { AuthService, User } from '../../iam/services/auth.service';
import { PlotService } from '../plots/services/plot.service';
import { FarmService } from '../farms/services/farm.service';
import { TelemetryService } from '../telemetry/services/telemetry.service';
import { Plot } from '../plots/model/plot.model';
import { Farm } from '../farms/model/farm.model';
import { IrrigationRecommendation } from '../telemetry/model/recommendation.model';
import { WaterStressAssessment } from '../telemetry/model/water-stress.model';

export type SimState = 'idle' | 'running' | 'done' | 'error';
export type MoistureLevel = 'optimal' | 'normal' | 'low' | 'critical';
export type TempLevel = 'cool' | 'warm' | 'hot' | 'extreme';
export type WindLevel = 'calm' | 'breezy' | 'strong' | 'gale';

@Component({
  selector: 'app-digital-twin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './digital-twin.html',
  styleUrl: './digital-twin.css',
})
export class DigitalTwinComponent implements OnInit {

  // ── Selectors ──────────────────────────────────────────────
  farms: Farm[] = [];
  plots: Plot[] = [];
  selectedFarmId: number | null = null;
  selectedPlotId: number | null = null;
  currentUser: User | null = null;

  // ── Scenario parameters ────────────────────────────────────
  soilMoisture = 35;
  temperature = 28;
  windSpeed = 12;
  droughtForecast = false;
  pestSeasonActive = false;

  // ── Simulation state ───────────────────────────────────────
  simState: SimState = 'idle';
  errorMessage = '';
  simStep = 0;

  // ── Results ────────────────────────────────────────────────
  latestAssessment: WaterStressAssessment | null = null;
  latestRecommendation: IrrigationRecommendation | null = null;

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
    this.selectedFarmId = +(event.target as HTMLSelectElement).value || null;
    this.selectedPlotId = null;
    this.reset();
  }

  onPlotChange(event: Event): void {
    this.selectedPlotId = +(event.target as HTMLSelectElement).value || null;
    this.reset();
  }

  private reset(): void {
    this.latestAssessment = null;
    this.latestRecommendation = null;
    this.simState = 'idle';
    this.errorMessage = '';
    this.simStep = 0;
  }

  // ── Computed getters ───────────────────────────────────────

  get filteredPlots(): Plot[] {
    if (!this.selectedFarmId) return this.plots;
    return this.plots.filter((p) => !p.farmId || p.farmId === this.selectedFarmId);
  }

  get selectedPlot(): Plot | null {
    return this.plots.find((p) => p.id === this.selectedPlotId) ?? null;
  }

  get canSimulate(): boolean {
    return this.simState !== 'running' && this.selectedPlotId !== null;
  }

  get moistureLevel(): MoistureLevel {
    if (this.soilMoisture >= 70) return 'optimal';
    if (this.soilMoisture >= 40) return 'normal';
    if (this.soilMoisture >= 20) return 'low';
    return 'critical';
  }

  get moistureLabel(): string {
    const map: Record<MoistureLevel, string> = {
      optimal: 'Optimal', normal: 'Normal', low: 'Low', critical: 'Critical',
    };
    return map[this.moistureLevel];
  }

  get tempLevel(): TempLevel {
    if (this.temperature <= 18) return 'cool';
    if (this.temperature <= 28) return 'warm';
    if (this.temperature <= 38) return 'hot';
    return 'extreme';
  }

  get windLevel(): WindLevel {
    if (this.windSpeed <= 10) return 'calm';
    if (this.windSpeed <= 30) return 'breezy';
    if (this.windSpeed <= 55) return 'strong';
    return 'gale';
  }

  get windLabel(): string {
    const map: Record<WindLevel, string> = {
      calm: 'Calm', breezy: 'Breezy', strong: 'Strong', gale: 'Gale Force',
    };
    return map[this.windLevel];
  }

  get stressBadgeClass(): string {
    const lvl = (this.latestAssessment?.stressLevel ?? '').toLowerCase();
    if (lvl.includes('high') || lvl.includes('critical') || lvl.includes('extreme')) return 'badge-critical';
    if (lvl.includes('medium') || lvl.includes('moderate')) return 'badge-moderate';
    return 'badge-ok';
  }

  get waterDots(): Array<{ x: number; y: number; size: number; delay: number }> {
    const count = Math.min(Math.floor(this.soilMoisture / 8), 12);
    return Array.from({ length: count }, (_, i) => ({
      x: ((i * 41 + 7) % 82) + 5,
      y: ((i * 29 + 12) % 60) + 15,
      size: ((i * 7) % 3) + 4,
      delay: (i * 0.3) % 2,
    }));
  }

  get plantHealth(): string {
    if (this.moistureLevel === 'optimal') return 'thriving';
    if (this.moistureLevel === 'normal') return 'healthy';
    if (this.moistureLevel === 'low') return 'stressed';
    return 'wilting';
  }

  get formattedStartTime(): { label: string; isSpecial: boolean } {
    const t = this.latestRecommendation?.suggestedStartTime ?? '';
    if (!t || t === '') return { label: '—', isSpecial: false };
    if (t === 'IMMEDIATE') return { label: 'Immediately', isSpecial: true };
    // Check if it looks like a time HH:mm
    if (/^\d{2}:\d{2}/.test(t)) return { label: t, isSpecial: false };
    return { label: t, isSpecial: true };
  }

  // ── Simulation ─────────────────────────────────────────────

  runSimulation(): void {
    if (!this.canSimulate || !this.selectedPlotId) return;
    const plotId = this.selectedPlotId;

    this.simState = 'running';
    this.simStep = 1;
    this.errorMessage = '';
    this.latestAssessment = null;
    this.latestRecommendation = null;
    this.cd.detectChanges();

    this.telemetryService.sendReading({ plotId, value: this.soilMoisture, type: 'SOIL_MOISTURE' })
      .pipe(
        tap(() => { this.simStep = 2; this.cd.detectChanges(); }),
        switchMap(() => this.telemetryService.sendReading({ plotId, value: this.temperature, type: 'TEMPERATURE' })),
        tap(() => { this.simStep = 3; this.cd.detectChanges(); }),
        switchMap(() => of(null).pipe(delay(1800))),
        tap(() => { this.simStep = 4; this.cd.detectChanges(); }),
        switchMap(() => this.telemetryService.getAssessmentsByPlot(plotId)),
        tap((assessments) => {
          this.latestAssessment = assessments[0] ?? null;
          this.simStep = 5;
          this.cd.detectChanges();
        }),
        switchMap(() => this.telemetryService.getRecommendationsByPlot(plotId)),
      )
      .subscribe({
        next: (recommendations) => {
          this.latestRecommendation = recommendations[0] ?? null;
          this.simState = 'done';
          this.cd.detectChanges();
        },
        error: () => {
          this.simState = 'error';
          this.errorMessage = 'Simulation failed. Verify that the plot has an active IoT node and try again.';
          this.cd.detectChanges();
        },
      });
  }

  acceptRecommendation(): void {
    if (!this.latestRecommendation || this.latestRecommendation.status === 'ACCEPTED') return;
    this.telemetryService.acceptRecommendation(this.latestRecommendation.id).subscribe({
      next: () => {
        this.latestRecommendation!.status = 'ACCEPTED';
        this.cd.detectChanges();
      },
    });
  }
}
