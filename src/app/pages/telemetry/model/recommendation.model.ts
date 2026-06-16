export type ReadingType = 'SOIL_MOISTURE' | 'TEMPERATURE';

export type RecommendationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface TelemetryReadingPayload {
  plotId: number;
  value: number;
  type: ReadingType;
}

// GET /api/v1/recommendations/plot/{plotId}
export interface IrrigationRecommendation {
  id: number;
  plotId: number;
  suggestedWaterAmount: number;
  suggestedDurationHours: number;
  suggestedStartTime: string;
  aiReasoning: string;
  status: RecommendationStatus;
  createdAt: string;
}

// GET /api/v1/plots/{plotId}/telemetry/latest  &  /history
export interface TelemetrySnapshot {
  id: string;
  soilMoisture: number;
  temperature: number;
  stressRisk: string;
  recordedAt: string;
}

export interface TransmissionLogEntry {
  timestamp: string;
  plotId: number;
  soilMoisture: number;
  temperature: number;
}
