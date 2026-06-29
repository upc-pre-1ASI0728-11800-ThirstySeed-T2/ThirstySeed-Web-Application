export interface DashboardMetrics {
  farms: number;
  plots: number;
  connectedNodes: number;
  totalNodes: number;
  criticalAlerts: number;
}

export interface PlotCard {
  plotId: number;
  plotName: string;
  farmName: string;
  imageUrl?: string;
  moisture: number;
  temperature: number;
  status: 'LOW' | 'MEDIUM' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'EXTREME';
}

export interface AlertCard {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface WaterStressCard {
  plotId: number;
  plotName: string;
  stressLevel: string;
  moisture: number;
  temperature: number;
}

export interface DashboardView {
  metrics: DashboardMetrics;
  plots: PlotCard[];
  alerts: AlertCard[];
  waterStress?: WaterStressCard;
  moistureTrend: number[];
}

export interface PlotAlert {
  id: number;
  plotId: number;
  moistureLevel: number;
  description: string;
  status: string;
  createdAt: string;
}
