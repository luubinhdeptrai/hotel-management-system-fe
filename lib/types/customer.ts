import type { ReservationStatus } from "@/lib/types/reservation";

export type CustomerType = "Cá nhân" | "Doanh nghiệp";
export type CustomerStatus = "Hoạt động" | "Đã vô hiệu";

// VIP Tier System
export type VIPTier = "STANDARD" | "VIP" | "PLATINUM";

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

// Spending thresholds for tier upgrades
export const VIP_TIER_THRESHOLDS: Record<VIPTier, number> = {
  STANDARD: 0, // 0 - 10M VND
  VIP: 10000000, // 10M - 50M VND
  PLATINUM: 50000000, // 50M+ VND
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
  isVip: boolean; // Deprecated - use vipTier instead
  vipTier: VIPTier; // NEW: VIP tier
  status: CustomerStatus;
  notes?: string;
  createdAt: string;
  lastVisit: string;
  totalBookings: number;
  totalSpent: number; // Total lifetime spending
  tags?: string[];
  history: CustomerHistoryRecord[];
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
