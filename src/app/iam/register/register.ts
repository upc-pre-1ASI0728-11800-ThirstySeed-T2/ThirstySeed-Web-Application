import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  fullName = '';
  email = '';
  username = '';
  accountType = '';
  password = '';
  confirmPassword = '';
  acceptedTerms = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(private router: Router) {}

  handleRegister(): void {
    const user = {
      fullName: this.fullName,
      email: this.email,
      username: this.username,
      accountType: this.accountType,
      password: this.password
    };

    console.log(user);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}