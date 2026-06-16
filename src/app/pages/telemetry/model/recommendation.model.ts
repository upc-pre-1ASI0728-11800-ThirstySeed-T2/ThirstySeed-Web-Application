export type ReadingType = 'SOIL_MOISTURE' | 'TEMPERATURE';

export type RecommendationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface TelemetryReadingPayload {
  plotId: number;
  value: number;
  type: ReadingType;
}

export interface IrrigationRecommendation {
  id: number;
  plotId: number;
  recommendedLitres: number;
  durationHours: number;
  startTime: string;
  reasoning: string;
  status: RecommendationStatus;
  createdAt: string;
}

export interface TransmissionLogEntry {
  timestamp: string;
  plotId: number;
  soilMoisture: number;
  temperature: number;
}
