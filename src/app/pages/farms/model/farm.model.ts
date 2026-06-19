export interface Farm {
  id: number;
  name: string;
  totalArea: number;
  producerId: number;
  waterManagementZoneId?: number;
  mainCrop?: string;
  createdAt?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  initialStatus?: string;
  description?: string;
  productionType?: string;
  farmId?: number;
}
