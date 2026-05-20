import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  constructor(private router: Router) {}

  handleSignIn(): void {
    const user = {
      username: this.username,
      password: this.password
    };

    console.log('Login user:', user);

    localStorage.setItem('authToken', 'demo-token');
    localStorage.setItem('userId', '1');

    this.router.navigate(['/account']);
  }

  goToSignUp(): void {
  this.router.navigate(['/register']);
  }

  goToForgotPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }
}