import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap, catchError } from 'rxjs';
import { AuthService } from '../../../iam/services/auth.service';
import { PlotService } from '../../plots/services/plot.service';
import { FarmService } from '../../farms/services/farm.service';
import { TelemetryService } from '../../telemetry/services/telemetry.service';
import { DashboardMetrics, PlotCard, WaterStressCard, AlertCard } from '../model/dashboard.model';
import { AlertService } from './alert.service';
import { Plot } from '../../plots/model/plot.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private authService: AuthService,
    private plotService: PlotService,
    private farmService: FarmService,
    private telemetryService: TelemetryService,
    private alertService: AlertService,
  ) {}

  getMetrics(): Observable<DashboardMetrics> {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return of({
        farms: 0,
        plots: 0,
        connectedNodes: 0,
        totalNodes: 0,
        criticalAlerts: 0,
      });
    }

    const farmIds = this.farmService.getSavedFarmIds(user.id);

    const farms = farmIds.length;

    const totalNodes = user.subscription?.maxNodes ?? 3;

    return this.getUserPlots().pipe(
      switchMap((plots) => {
        if (!plots.length) {
          return of({
            farms,
            plots: 0,
            connectedNodes: 0,
            totalNodes,
            criticalAlerts: 0,
          });
        }

        const nodeRequests = plots.map((plot) => this.telemetryService.getNodesByPlot(plot.id));

        const alertRequests = plots.map((plot) => this.alertService.getAlertsByPlot(plot.id));

        return forkJoin({
          allNodes: forkJoin(nodeRequests),
          allAlerts: forkJoin(alertRequests),
        }).pipe(
          map(({ allNodes, allAlerts }) => {
            const connectedNodes = allNodes.flat().length;

            const criticalAlerts = allAlerts
              .flat()
              .filter((alert) => alert.status === 'CRITICAL').length;

            return {
              farms,
              plots: plots.length,
              connectedNodes,
              totalNodes,
              criticalAlerts,
            };
          }),
        );
      }),
    );
  }

  getPlotMonitoring(): Observable<PlotCard[]> {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return of([]);
    }

    return this.getUserPlots().pipe(
      switchMap((plots) => {
        if (!plots.length) {
          return of([]);
        }

        const requests = plots.map((plot) =>
          this.telemetryService.getLatestSnapshot(plot.id).pipe(
            map((snapshot) => ({
              plotId: plot.id,
              plotName: plot.name,
              farmName: plot.location,
              imageUrl: plot.imageUrl,
              moisture: snapshot.soilMoisture,
              temperature: snapshot.temperature,
              status: snapshot.stressRisk as 'LOW' | 'MODERATE' | 'CRITICAL',
            })),
            catchError(() =>
              of({
                plotId: plot.id,
                plotName: plot.name,
                farmName: plot.location,
                imageUrl: plot.imageUrl,
                moisture: 0,
                temperature: 0,
                status: 'LOW' as const,
              }),
            ),
          ),
        );

        return forkJoin(requests);
      }),
    );
  }

  getLatestAlerts(): Observable<AlertCard[]> {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return of([]);
    }

    return this.getUserPlots().pipe(
      switchMap((plots) => {
        if (!plots.length) {
          return of([]);
        }

        const requests = plots.map((plot) => this.alertService.getAlertsByPlot(plot.id));

        return forkJoin(requests).pipe(
          map((allAlerts) => {
            const alerts = allAlerts
              .flat()
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 3)
              .map((alert) => ({
                id: alert.id,
                title: alert.status === 'CRITICAL' ? 'Critical moisture drop' : 'Irrigation alert',

                description: alert.description,

                status: alert.status,

                createdAt: alert.createdAt,
              }));

            return alerts;
          }),
        );
      }),
    );
  }

  getWaterStressCard(): Observable<WaterStressCard | undefined> {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return of(undefined);
    }

    return this.getUserPlots().pipe(
      switchMap((plots) => {
        if (!plots.length) {
          return of(undefined);
        }

        const requests = plots.map((plot) =>
          this.telemetryService.getAssessmentsByPlot(plot.id).pipe(
            map((assessments) => ({
              plot,
              assessment: assessments[0],
            })),
          ),
        );

        return forkJoin(requests).pipe(
          switchMap((results) => {
            const stress = results.find((x) => x.assessment && x.assessment.stressLevel !== 'LOW');

            if (!stress) {
              return of(undefined);
            }

            return this.telemetryService.getLatestSnapshot(stress.plot.id).pipe(
              map((snapshot) => ({
                plotId: stress.plot.id,

                plotName: stress.plot.name,

                stressLevel: stress.assessment.stressLevel,

                moisture: snapshot.soilMoisture,

                temperature: snapshot.temperature,
              })),
            );
          }),
        );
      }),
    );
  }

  getMoistureTrend(): Observable<number[]> {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return of([0, 0, 0, 0, 0, 0, 0]);
    }

    return this.getUserPlots().pipe(
      tap((plots) => console.log('PLOTS FROM API', plots)),
      switchMap((plots) => {
        if (!plots.length) {
          return of([0, 0, 0, 0, 0, 0, 0]);
        }

        const firstPlot = plots[0];

        return this.telemetryService.getTelemetryHistory(firstPlot.id, 168).pipe(
          map((history) => {
            const days = [0, 0, 0, 0, 0, 0, 0];
            const counts = [0, 0, 0, 0, 0, 0, 0];

            history.forEach((reading) => {
              const date = new Date(reading.recordedAt);

              const day = date.getDay();

              const index = day === 0 ? 6 : day - 1;

              days[index] += reading.soilMoisture;

              counts[index]++;
            });

            return days.map((total, i) => (counts[i] ? Math.round(total / counts[i]) : 0));
          }),
        );
      }),
    );
  }

  private getUserPlots(): Observable<Plot[]> {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return of([]);
    }

    return this.plotService.getPlotsByUser(user.id).pipe(
      map((plots) => {
        const merged = this.plotService.mergeWithStoredPlots(user.id, plots);

        console.log('BACKEND PLOTS', plots);
        console.log('MERGED PLOTS', merged);

        return merged;
      }),
    );
  }
}
