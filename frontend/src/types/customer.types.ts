export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  addresses?: any[];
  orders?: any[];
}