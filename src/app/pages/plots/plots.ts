import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlotService } from '../../pages/plots/services/plot.service';
import { Plot } from '../../pages/plots/model/plot.model';
import { AuthService } from '../../iam/services/auth.service';
import { HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-plots',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plots.html',
  styleUrl: './plots.css',
})
export class PlotsComponent implements OnInit {
  plots: Plot[] = [];
  loading = false;
  errorMessage = '';
  selectedFarmName = 'All farms';

constructor(
  private plotService: PlotService,
  private authService: AuthService,
  private cd: ChangeDetectorRef   // <- agregar esto
) {}

  ngOnInit(): void {
    this.loadPlots();
  }

  loadPlots(): void {
    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();

    if (!user || !token) return;

    this.loading = true;
    this.errorMessage = '';

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Trae plots solo del usuario logueado
    this.plotService.getPlotsByUser(user.id).subscribe({
      next: (plots) => {
        this.plots = plots;
        this.loading = false;
        if (plots.length > 0) this.selectedFarmName = plots[0].name;

        // Forzar detección de cambios para que se renderice inmediatamente
        this.cd.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar los plots';
        this.loading = false;
        console.error(err);
        this.cd.detectChanges();
      },
    });
  }

  get totalPlots() {
    return this.plots.length;
  }

  get plotsWithNodes() {
    return this.plots.filter(p => p.status === 'Online').length;
  }

  get plotsAtRisk() {
    return this.plots.filter(p => p.status === 'Moderate' || p.status === 'High').length;
  }

  createPlot(): void {
    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    if (!user || !token) return;

    const newPlot: Partial<Plot> = {
      userId: user.id,
      name: 'New Plot',
      location: 'Farm Example',
      extension: 5,
      imageUrl: ''
    };

    this.plotService.createPlot(newPlot).subscribe({
      next: (plot) => {
        this.plots.push(plot);
        this.selectedFarmName = plot.name;

        // Forzar detección de cambios para que aparezca en la UI
        this.cd.detectChanges();
      },
      error: (err) => console.error('Failed to create plot', err)
    });
  }
}