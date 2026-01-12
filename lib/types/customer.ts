import type { ReservationStatus } from "@/lib/types/reservation";
import type { CustomerRank } from "@/lib/types/customer-rank";

export type CustomerType = "Cá nhân" | "Doanh nghiệp";
export type CustomerStatus = "Hoạt động" | "Đã vô hiệu";

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
  notes?: string;
}

export interface CustomerFilters {
  searchQuery: string;
  typeFilter: CustomerType | "Tất cả";
  rankFilter: string | "Tất cả"; // rankId or "Tất cả"
}

export interface CustomerStatistics {
  totalCustomers: number;
  vipCustomers: number;
  inactiveCustomers: number;
  corporateCustomers: number;
  totalLifetimeValue: number;
}
