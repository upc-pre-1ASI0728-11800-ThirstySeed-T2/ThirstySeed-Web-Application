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
import { IotSimulatorComponent } from './pages/telemetry/iot-simulator/iot-simulator';
import { WaterManagerDashboardComponent } from './pages/water-zones/water-manager-dashboard/water-manager-dashboard';
import { CreateWaterZoneComponent } from './pages/water-zones/create-water-zone/create-water-zone';
import { waterManagerGuard } from './iam/guards/water-manager.guard';

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
      { path: 'iot-simulator', component: IotSimulatorComponent },
      {
        path: 'water-manager',
        canActivate: [waterManagerGuard],
        children: [
          { path: 'dashboard', component: WaterManagerDashboardComponent },
          { path: 'zones/create', component: CreateWaterZoneComponent },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
