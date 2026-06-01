import { Routes } from '@angular/router';
import { LoginComponent } from './iam/login/login';
import { RegisterComponent } from './iam/register/register';
import { SubscriptionComponent } from './iam/subscription/subscription';
import { ForgetPasswordComponent } from './iam/forget-password/forget-password';
import { MainLayoutComponent } from './main-layout/main-layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { PlotsComponent } from './pages/plots/plots';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'subscription', component: SubscriptionComponent },
  { path: 'forgot-password', component: ForgetPasswordComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [{ path: 'dashboard', component: DashboardComponent }, {path: 'plots', component: PlotsComponent}],
  },
];
