import { Routes } from '@angular/router';
import { LoginComponent } from './iam/login/login';
import { RegisterComponent } from './iam/register/register';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];