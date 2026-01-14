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
  // Schema fields
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  idNumber: string | null; // CMND/CCCD
  address: string | null;
  imageUrl: string | null;
  isEmailVerified: boolean;

  // Relations / Computed
  rankId: string | null;
  rank: CustomerRank | null;
  totalSpent: number; // Decimal -> number

  // Legacy/UI fields (mapped or deprecated)
  customerId?: string; // alias for id
  customerName?: string; // alias for fullName
  phoneNumber?: string; // alias for phone
  identityCard?: string; // alias for idNumber

  // UI Specific
  nationality?: string;
  customerType?: CustomerType;
  status?: CustomerStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  lastVisit?: string;
  totalBookings?: number;
  tags?: string[];
  history?: CustomerHistoryRecord[];
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
