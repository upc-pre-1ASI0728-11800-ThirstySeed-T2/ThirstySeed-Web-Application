import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FarmService } from '../services/farm.service';
import { AuthService } from '../../../iam/services/auth.service';

@Component({
  selector: 'app-farm-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './farm-create.html',
  styleUrl: './farm-create.css',
})
export class FarmCreateComponent {
farm = {
  name: '',
  totalArea: undefined as number | undefined,
  location: '',
  productionType: '',
  initialStatus: '',
  description: '',
};

  loading = false;
  errorMessage = '';

  constructor(
    private farmService: FarmService,
    private authService: AuthService,
    private router: Router
  ) {}

createFarm(): void {
  const user = this.authService.getCurrentUser();
  if (!user) { this.errorMessage = 'User not logged in.'; return; }
  if (!this.farm.name) { this.errorMessage = 'Name is required.'; return; }

  this.loading = true;
  const payload = {
    name: this.farm.name,
    totalArea: this.farm.totalArea ?? 0,
    producerId: user.id   // ← usa el id del usuario logueado
  };

  this.farmService.createFarm(payload).subscribe({
    next: () => { this.loading = false; this.router.navigate(['/farms']); },
    error: (err) => { this.errorMessage = 'Failed to create farm.'; this.loading = false; }
  });
}

  cancel(): void {
    this.router.navigate(['/farms']);
  }
}