// Penalty (Phí phạt) Type Definitions
// Types for penalties: equipment damage, lost items, rule violations, etc.

export interface PenaltyItem {
  penaltyID: string;
  penaltyName: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  isOpenPrice?: boolean; // Allow open price entry (e.g., damage with variable cost)
  createdAt: Date;
  updatedAt: Date;
}

export interface PenaltyFormData {
  penaltyName: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isOpenPrice?: boolean;
}

export interface PenaltyFilterOptions {
  searchTerm: string;
  status: "active" | "inactive" | "all";
}
