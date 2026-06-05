export interface Plot {
  id: number;
  userId: number;
  name: string;
  location: string;
  extension: number;
  status: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  nodes?: number;
}