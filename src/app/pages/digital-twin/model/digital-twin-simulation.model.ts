export interface SaveSimulationItemRequest {
  referenceId: number;
  referenceName: string;
  referenceType: string;
  simulatedWaterAmount: number;
  coveragePercentage: number;
  riskLevel: string;
  recommendation: string;
}

export interface SaveSimulationRequest {
  simulationType: string;
  scopeName: string;
  inputWaterAmount: number;
  highRiskCount: number;
  averageCoveragePercentage: number;
  recommendation: string;
  items: SaveSimulationItemRequest[];
}

export interface DigitalTwinSimulationItem {
  id: number;
  referenceId: number;
  referenceName: string;
  referenceType: string;
  simulatedWaterAmount: number;
  coveragePercentage: number;
  riskLevel: string;
  recommendation: string;
}

export interface DigitalTwinSimulation {
  id: number;
  userId: number;
  username: string;
  simulationType: string;
  scopeName: string;
  inputWaterAmount: number;
  highRiskCount: number;
  averageCoveragePercentage: number;
  recommendation: string;
  createdAt: string;
  updatedAt: string;
  items: DigitalTwinSimulationItem[];
}
