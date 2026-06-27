import { Routes } from '@angular/router';
import { authGuard } from './iam/guards/auth.guard';
import { waterManagerGuard } from './iam/guards/water-manager.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./iam/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./iam/register/register').then(m => m.RegisterComponent) },
  { path: 'subscription', loadComponent: () => import('./iam/subscription/subscription').then(m => m.SubscriptionComponent) },
  { path: 'forgot-password', loadComponent: () => import('./iam/forget-password/forget-password').then(m => m.ForgetPasswordComponent) },
  {
    path: '',
    loadComponent: () => import('./main-layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'plots', loadComponent: () => import('./pages/plots/plots').then(m => m.PlotsComponent) },
      { path: 'plots/create', loadComponent: () => import('./pages/plots/create_plots/create-plot').then(m => m.CreatePlotComponent) },
      { path: 'farms', loadComponent: () => import('./pages/farms/farms').then(m => m.FarmsComponent) },
      { path: 'farms/create', loadComponent: () => import('./pages/farms/create_farms/farm-create').then(m => m.FarmCreateComponent) },
      { path: 'telemetry', loadComponent: () => import('./pages/telemetry/telemetry').then(m => m.TelemetryComponent) },
      { path: 'iot-simulator', loadComponent: () => import('./pages/telemetry/iot-simulator/iot-simulator').then(m => m.IotSimulatorComponent) },
      { path: 'digital-twin', loadComponent: () => import('./pages/digital-twin/digital-twin').then(m => m.DigitalTwinComponent) },
      { path: 'support', loadComponent: () => import('./pages/support/support').then(m => m.SupportComponent) },
      { path: 'profile-rol', loadComponent: () => import('./pages/profile-rol/profile-rol').then(m => m.ProfileRol) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsComponent) },
      {
        path: 'water-manager',
        canActivate: [waterManagerGuard],
        children: [
          { path: 'dashboard', loadComponent: () => import('./pages/water-zones/water-manager-dashboard/water-manager-dashboard').then(m => m.WaterManagerDashboardComponent) },
          { path: 'zones/create', loadComponent: () => import('./pages/water-zones/create-water-zone/create-water-zone').then(m => m.CreateWaterZoneComponent) },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
