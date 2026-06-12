export interface Farm {
  id: number;
  name: string;
  totalArea: number;
  producerId: number;
  createdAt?: string;

  location?: string;
  initialStatus?: string;
  description?: string;
  productionType?: string;

  farmId?: number;
}
