import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlotService } from '../../pages/plots/services/plot.service';
import { Plot } from '../../pages/plots/model/plot.model';
import { AuthService } from '../../iam/services/auth.service';

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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPlots();
  }

  loadPlots(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.loading = true;
    this.errorMessage = '';

    this.plotService.getPlotsByUser(user.id).subscribe({
      next: (plots) => {
        this.plots = plots;
        this.loading = false;
        if (plots.length > 0) this.selectedFarmName = plots[0].name;
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar los plots';
        this.loading = false;
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
}