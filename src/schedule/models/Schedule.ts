export interface Schedule {
  id?: number;
  plotId: number;
  waterAmount: number;
  pressure: number;
  sprinklerRadius: number;
  expectedMoisture: number;
  estimatedTimeHours: number;
  setTime: string;
  angle: number;
  isAutomatic: boolean;
}