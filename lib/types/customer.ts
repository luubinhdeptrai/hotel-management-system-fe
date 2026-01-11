import type { ReservationStatus } from "@/lib/types/reservation";
import type { CustomerRank } from "@/lib/types/customer-rank";

export type CustomerType = "Cá nhân" | "Doanh nghiệp";
export type CustomerStatus = "Hoạt động" | "Đã vô hiệu";

// DEPRECATED: Old hardcoded VIP tier system - replaced by dynamic CustomerRank from Backend
export type VIPTier = "STANDARD" | "VIP" | "PLATINUM";

// DEPRECATED: Remove these after migration is complete
export const VIP_TIER_LABELS: Record<VIPTier, string> = {
  STANDARD: "Khách hàng thường",
  VIP: "VIP",
  PLATINUM: "Platinum VIP",
};

export const VIP_TIER_COLORS: Record<VIPTier, string> = {
  STANDARD: "bg-gray-100 text-gray-800",
  VIP: "bg-amber-100 text-amber-800",
  PLATINUM: "bg-purple-100 text-purple-800",
};

export const VIP_TIER_THRESHOLDS: Record<VIPTier, number> = {
  STANDARD: 0,
  VIP: 10000000,
  PLATINUM: 50000000,
};

export interface CustomerHistoryRecord {
  reservationId: string;
  checkInDate: string;
  checkOutDate: string;
  roomName: string;
  roomTypeName: string;
  status: ReservationStatus;
  totalAmount: number;
}

export interface CustomerRecord {
  customerId: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  identityCard: string;
  address: string;
  nationality: string;
  customerType: CustomerType;
  isVip: boolean; // DEPRECATED - use rank instead
  vipTier: VIPTier; // DEPRECATED - use rank instead
  status: CustomerStatus;
  notes?: string;
  createdAt: string;
  lastVisit: string;
  totalBookings: number;
  totalSpent: number; // Total lifetime spending from Backend
  tags?: string[];
  history: CustomerHistoryRecord[];
  
  // NEW: Dynamic rank system from Backend
  rank: CustomerRank | null; // Customer's current rank (null = no rank)
  rankId: string | null; // Rank ID reference
}

export interface CustomerFormData {
  customerName: string;
  phoneNumber: string;
  email: string;
  identityCard: string;
  address: string;
  nationality: string;
  customerType: CustomerType;
  isVip: boolean;
  notes?: string;
}

export interface CustomerFilters {
  searchQuery: string;
  typeFilter: CustomerType | "Tất cả";
  vipFilter: "Tất cả" | "VIP" | "Thường";
}

export interface CustomerStatistics {
  totalCustomers: number;
  vipCustomers: number;
  inactiveCustomers: number;
  corporateCustomers: number;
  totalLifetimeValue: number;
}
