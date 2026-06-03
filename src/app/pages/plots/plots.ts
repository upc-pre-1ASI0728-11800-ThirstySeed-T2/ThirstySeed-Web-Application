import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PlotService } from '../../pages/plots/services/plot.service';
import { Plot } from '../../pages/plots/model/plot.model';
import { AuthService } from '../../iam/services/auth.service';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-plots',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlots();
  }

  loadPlots(): void {
    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();

    if (!user || !token) {
      this.errorMessage = 'User not logged in or token missing.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

this.plotService.getPlotsByUser(user.id).subscribe({
  next: (plots) => {
    this.plots = plots;
    this.loading = false;
    if (plots.length > 0) this.selectedFarmName = plots[0].name;

    // Fuerza detección de cambios sin que NG0100 se dispare
    setTimeout(() => this.cd.detectChanges());
  },
  error: (err) => {
    this.errorMessage = 'No se pudieron cargar los plots';
    this.loading = false;
    console.error(err);
    setTimeout(() => this.cd.detectChanges());
  },
});
  }

  createPlot(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    const newPlot: Partial<Plot> = {
      userId: user.id,
      name: 'New Plot',
      location: 'Farm Example',
      extension: 5,
      imageUrl: '',
      status: 'Active'
    };

    this.plotService.createPlot(newPlot).subscribe({
      next: () => {
        // Recargar la lista completa desde el backend
        this.loadPlots();
      },
      error: (err) => {
        this.errorMessage = 'Failed to create plot.';
        console.error(err);
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

  goToCreatePlot() {
    this.router.navigate(['/plots/create']);
  }
}