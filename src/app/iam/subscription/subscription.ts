import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-subscription',
  standalone: true,
  templateUrl: './subscription.html',
  styleUrl: './subscription.css',
})
export class SubscriptionComponent {

  private backendUrl = `${environment.apiBaseUrl}/api/v1/subscriptions`;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
  ) {}

  // 🔥 IMPORTANTE: UI usa "Plus" | "Premium"
  selectPlan(plan: 'Plus' | 'Premium'): void {

  const user = this.authService.getCurrentUser();

  if (!user) {
    this.router.navigate(['/login']);
    return;
  }

  const token = this.authService.getToken();

  if (!token) {
    this.router.navigate(['/login']);
    return;
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  const planType = plan === 'Plus' ? 'PLUS' : 'PREMIUM';

  const payload = {
    userId: user.id,
    planType,
    status: 'ACTIVE',
    active: true,
    maxFarms: plan === 'Plus' ? 3 : 10,
    maxNodes: plan === 'Plus' ? 3 : 10,
    validationCode: ''
  };

  this.http.post(this.backendUrl, payload, { headers })
    .subscribe({
      next: (res: any) => {

        console.log('OK subscription:', res);

        user.subscription = {
          name: plan,
          price: plan === 'Plus' ? 19 : 39,
          maxNodes: plan === 'Plus' ? 3 : 10,
          features: plan === 'Plus'
            ? [
                'Basic plot monitoring',
                'Water stress alerts',
                'Sensor history access',
              ]
            : [
                'Predictive irrigation',
                'Weather support',
                'Priority alerts & reports',
              ],
        };

        this.authService.setCurrentUser(user);

        this.router.navigate(['/dashboard']);
      },

      error: (err) => {
        console.error('FAILED subscription:', err);
        alert('Unable to update subscription. Please try again.');
      }
    });
}

  goBack(): void {
    this.router.navigate(['/register']);
  }
}