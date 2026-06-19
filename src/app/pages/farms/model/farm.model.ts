export interface Farm {
  id: number;
  name: string;
  totalArea: number;
  producerId: number;
  waterManagementZoneId?: number;
  mainCrop?: string;
  createdAt?: string;
  location?: string;
  initialStatus?: string;
  description?: string;
  productionType?: string;
  farmId?: number;
}
