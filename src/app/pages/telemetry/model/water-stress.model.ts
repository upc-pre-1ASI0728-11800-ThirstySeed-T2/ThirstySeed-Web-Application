export interface WaterStressAssessment {
  id: string;
  plotId: number;
  readingValue: number;
  stressLevel: string;

  weatherContext: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitationProbability: number;
  };

  evaluatedAt: string;
}
