import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionService, Subscription } from '../../iam/services/subscription.service';

@Component({
  selector: 'app-profile-rol',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-rol.html',
  styleUrl: './profile-rol.css',
})
export class ProfileRol implements OnInit {

  userId!: number;
  subscription!: Subscription;
  loading = true;

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const id = localStorage.getItem('userId');

    if (!id) {
      this.router.navigate(['/login']);
      return;
    }

    this.userId = Number(id);

    this.loadSubscription();
  }

  loadSubscription() {
    this.subscriptionService.getByUserId(this.userId)
      .subscribe({
        next: (res) => {
          this.subscription = res;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  // 🔥 SOLO NAVEGACIÓN, NO CREAR DATA
  goToChangePlan() {
    this.router.navigate(['/subscription']);
  }
}