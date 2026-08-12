export interface RoomDisplay {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  taxesAndFees?: number;
  image: string;
  gallery?: string[];
  features: string[];
  capacity?: number;
  bedType?: string;
  cancellation?: string;
  policies?: string[];
}