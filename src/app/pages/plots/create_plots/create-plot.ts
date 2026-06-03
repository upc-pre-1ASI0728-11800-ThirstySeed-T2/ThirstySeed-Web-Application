import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlotService } from '../services/plot.service';
import { AuthService } from '../../../iam/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-plot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-plot.html',
  styleUrl: '../plots.css',
})
export class CreatePlotComponent {
  plotName = '';
  location = '';
  extension = 0;
  status = 'Active';
  imageUrl = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private plotService: PlotService,
    private authService: AuthService,
    private router: Router
  ) {}

  createPlot() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    const newPlot = {
      userId: user.id,
      name: this.plotName,
      location: this.location,
      extension: this.extension,
      status: this.status,
      imageUrl: this.imageUrl
    };

    this.plotService.createPlot(newPlot).subscribe({
      next: () => {
        this.successMessage = 'Plot created successfully!';
        // Limpiar formulario
        this.plotName = '';
        this.location = '';
        this.extension = 0;
        this.status = 'Active';
        this.imageUrl = '';

        // Redirigir a lista de plots para recargar desde backend
        this.router.navigate(['/plots']);
      },
      error: (err) => {
        this.errorMessage = 'Failed to create plot.';
        console.error(err);
      }
    });
  }
}