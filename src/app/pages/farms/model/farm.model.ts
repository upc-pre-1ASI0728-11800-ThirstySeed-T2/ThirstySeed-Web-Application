export interface Farm {
  id: number;
  name: string;
  totalArea: number;
  producerId: number;
  createdAt?: string;
  // Campos solo visuales (no vienen del backend)
  location?: string;
  initialStatus?: string;
  description?: string;
  productionType?: string;
}