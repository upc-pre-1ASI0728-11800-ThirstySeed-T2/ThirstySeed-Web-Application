export interface Farm {
  id: number;
  name: string;
  totalArea: number;
  producerId: number;
  // Campos opcionales (el backend no los exige pero el HTML los usa)
  location?: string;
  initialStatus?: string;
  description?: string;
  productionType?: string;
  userId?: number;
}