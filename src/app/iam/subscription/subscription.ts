import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-subscription',
  standalone: true,
  templateUrl: './subscription.html',
  styleUrl: './subscription.css',
})
export class SubscriptionComponent {
  private backendUrl = 'https://thirstyseed-api.onrender.com/api/v1/subscriptions';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
  ) {}

  selectPlan(plan: 'Plus' | 'Premium'): void {
    const user = this.authService.getCurrentUser();

    console.log('Current user:', user);
    console.log('Selected plan:', plan);

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Tomar token JWT
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Llamada al backend para actualizar la suscripción
    this.http.post(this.backendUrl, { userId: user.id, planType: plan === 'Plus' ? 'PLUS' : 'PREMIUM', }, { headers },).subscribe({
        next: (res) => {
          console.log('Subscription updated successfully', res);

          // Actualizar usuario local con plan (opcional)
          user.subscription =
            plan === 'Plus'
              ? {
                  name: 'Plus',
                  price: 19,
                  maxNodes: 3,
                  features: [
                    'Basic plot monitoring',
                    'Water stress alerts',
                    'Sensor history access',
                  ],
                }
              : {
                  name: 'Premium',
                  price: 39,
                  maxNodes: 10,
                  features: [
                    'Predictive irrigation',
                    'Weather support',
                    'Priority alerts & reports',
                  ],
                };
          this.authService.setCurrentUser(user);

          this.router.navigate(['/dashboard']); // Redirigir al dashboard
        },
        error: (err) => {
          console.error('Failed to update subscription', err);
          alert('Unable to update subscription. Please try again.');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/register']);
  }
}
