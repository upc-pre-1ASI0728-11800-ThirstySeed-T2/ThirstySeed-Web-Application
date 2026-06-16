export interface CreateWaterZoneRequest {
  waterManagerUserId: number;
  name: string;
  location: string;
  description: string;
}

export interface WaterZone {
  id: number;
  waterManagerUserId: number;
  name: string;
  location: string;
  description: string;
  createdAt?: string;
}

export interface WaterConsumptionSummary {
  zoneId: number;
  zoneName: string;
  totalFarms: number;
  totalPlots: number;
  totalWaterConsumedLitres: number;
}
