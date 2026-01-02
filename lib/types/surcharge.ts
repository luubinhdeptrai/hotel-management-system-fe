// Surcharge (Phụ thu) Type Definitions
// Types for surcharges: early check-in, late check-out, extra person, pets, etc.

export interface SurchargeItem {
  surchargeID: string;
  surchargeName: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  isOpenPrice?: boolean; // Allow open price entry
  createdAt: Date;
  updatedAt: Date;
}

export interface SurchargeFormData {
  surchargeName: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isOpenPrice?: boolean;
}

export interface SurchargeFilterOptions {
  searchTerm: string;
  status: "active" | "inactive" | "all";
}
