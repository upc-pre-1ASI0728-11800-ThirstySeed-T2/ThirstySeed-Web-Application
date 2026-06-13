import { Routes } from '@angular/router';
import { LoginComponent } from './iam/login/login';
import { RegisterComponent } from './iam/register/register';
import { SubscriptionComponent } from './iam/subscription/subscription';
import { ForgetPasswordComponent } from './iam/forget-password/forget-password';
import { MainLayoutComponent } from './main-layout/main-layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { PlotsComponent } from './pages/plots/plots';
import { CreatePlotComponent } from './pages/plots/create_plots/create-plot';
import { FarmsComponent } from './pages/farms/farms';
import { FarmCreateComponent } from './pages/farms/create_farms/farm-create';
import { authGuard } from './iam/guards/auth.guard';
import { TelemetryComponent } from './pages/telemetry/telemetry';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'subscription', component: SubscriptionComponent },
  { path: 'forgot-password', component: ForgetPasswordComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'plots', component: PlotsComponent },
      { path: 'plots/create', component: CreatePlotComponent },
      { path: 'farms', component: FarmsComponent },
      { path: 'farms/create', component: FarmCreateComponent },
      { path: 'telemetry', component: TelemetryComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
