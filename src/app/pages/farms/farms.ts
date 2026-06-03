import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FarmService } from './services/farm.service';
import { Farm } from './model/farm.model';
import { AuthService } from '../../iam/services/auth.service';

@Component({
  selector: 'app-farms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './farms.html',
  styleUrl: './farms.css',
})
export class FarmsComponent implements OnInit {
  farms: Farm[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private farmService: FarmService,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFarms();
  }

  loadFarms(): void {
    const user = this.authService.getCurrentUser();
    if (!user) { this.errorMessage = 'User not logged in.'; return; }

    const ids = this.farmService.getSavedFarmIds();

    if (ids.length === 0) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.farmService.getFarmsByIds(ids).subscribe({
      next: (farms) => {
        this.farms = farms;
        this.loading = false;
        setTimeout(() => this.cd.detectChanges());
      },
      error: () => {
        this.errorMessage = 'Could not load farms.';
        this.loading = false;
        setTimeout(() => this.cd.detectChanges());
      }
    });
  }

  get totalFarms()       { return this.farms.length; }
  get totalActivePlots() { return 0; }
  get farmsWithNodes()   { return this.farms.filter(f => f.initialStatus === 'Active').length; }
  get farmsWithRisk()    { return this.farms.filter(f => f.initialStatus === 'Moderate' || f.initialStatus === 'High').length; }

  goToCreate(): void {
    this.router.navigate(['/farms/create']);
  }

  openFarm(farmId: number): void {
    this.router.navigate(['/farms', farmId]);
  }
}