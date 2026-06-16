// POST /api/v1/plot/zone — body
export interface CreateWaterZoneRequest {
  waterManagerUserId: number;
  name: string;
  location: string;
  description: string;
}

// POST /api/v1/plot/zone — response
// GET /api/v1/plot/zones[]
// GET /api/v1/plot/wm/{userId}/zone
export interface WaterZone {
  id: number;
  name: string;
  location: string;
  description: string;
  waterManagerUserId: number;
  status: string;
  createdAt: string;
}

// GET /api/v1/zones/{zoneId}/water-consumption
export interface WaterConsumptionSummary {
  zoneId: number;
  zoneName: string;
  totalFarms: number;
  totalPlots: number;
  totalWaterConsumedLitres: number;
}

// GET /api/v1/plot/wm/{userId}/dashboard
export interface WaterManagerDashboard {
  waterManagerUserId: number;
  monitoredFarms: number;
  monitoredPlots: number;
  activeProducers: number;
  totalMonitoredArea: number;
  farms: WaterManagerFarmSummary[];
}

export interface WaterManagerFarmSummary {
  farmId: number;
  farmName: string;
  producerId: number;
  totalArea: number;
  plotCount: number;
  status: string;
}

// GET/POST /api/v1/plot/wm/{userId}/distribution
// PUT  /api/v1/plot/wm/{userId}/distribution/{planId}/item/{itemId}
export interface WaterDistributionPlan {
  id: number;
  waterManagerUserId: number;
  zoneId: number;
  totalAvailableWater: number;
  totalAssignedWater: number;
  remainingWater: number;
  coveragePercentage: number;
  status: string;
  createdAt: string;
  items: WaterDistributionItem[];
}

export interface WaterDistributionItem {
  id: number;
  farmId: number;
  farmName: string;
  producerId: number;
  farmArea: number;
  suggestedWaterAmount: number;
  assignedWaterAmount: number;
  coveragePercentage: number;
  editedManually: boolean;
  status: string;
}
