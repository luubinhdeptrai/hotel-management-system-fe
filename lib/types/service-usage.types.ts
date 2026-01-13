// Service Usage Types - Complete definitions based on Backend

export type ServiceUsageStatus = "PENDING" | "TRANSFERRED" | "COMPLETED" | "CANCELLED";

export interface ServiceUsage {
  id: string;
  bookingId?: string;
  bookingRoomId?: string;
  employeeId: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  customPrice?: number; // Only for penalty/surcharge
  totalPrice: number; // Backend calculated: unitPrice × quantity
  totalPaid: number; // Amount paid so far
  note?: string;
  status: ServiceUsageStatus;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  service?: {
    id: string;
    name: string;
    price: number;
    unit: string;
    isActive: boolean;
  };
  booking?: {
    bookingCode: string;
    primaryCustomer?: {
      fullName: string;
    };
  };
  bookingRoom?: {
    id: string;
    room?: {
      roomNumber: string;
    };
  };
  employee?: {
    name: string;
  };
}

// Calculated fields (not stored in DB)
export interface ServiceUsageWithBalance extends ServiceUsage {
  balance: number; // totalPrice - totalPaid
}

// Request types
export interface CreateServiceUsageRequest {
  bookingId?: string; // Optional - omit for guest services
  bookingRoomId?: string; // Optional - omit for booking-level services
  serviceId: string;
  quantity: number;
  note?: string;
}

export interface UpdateServiceUsageRequest {
  quantity?: number; // Only when status = PENDING
  status?: ServiceUsageStatus; // Follow valid transitions
}

// Query parameters
export interface GetServiceUsagesParams {
  bookingId?: string;
  bookingRoomId?: string;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Response types
export interface GetServiceUsagesResponse {
  data: ServiceUsage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Status labels for UI
export const SERVICE_USAGE_STATUS_LABELS: Record<ServiceUsageStatus, string> = {
  PENDING: "Chờ xử lý",
  TRANSFERRED: "Đã cung cấp",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

// Status colors for badges
export const SERVICE_USAGE_STATUS_COLORS: Record<ServiceUsageStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  TRANSFERRED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

// Valid status transitions (as defined by Backend)
export const VALID_STATUS_TRANSITIONS: Record<ServiceUsageStatus, ServiceUsageStatus[]> = {
  PENDING: ["TRANSFERRED", "CANCELLED"],
  TRANSFERRED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [], // Cannot change from COMPLETED
  CANCELLED: [], // Cannot change from CANCELLED
};

// Helper function to calculate balance
export function calculateBalance(serviceUsage: ServiceUsage): number {
  return serviceUsage.totalPrice - serviceUsage.totalPaid;
}

// Helper function to check if can edit quantity
export function canEditQuantity(serviceUsage: ServiceUsage): boolean {
  return serviceUsage.status === "PENDING";
}

// Helper function to check if can delete
export function canDelete(serviceUsage: ServiceUsage): boolean {
  return (
    serviceUsage.totalPaid === 0 &&
    serviceUsage.status !== "COMPLETED"
  );
}

// Helper function to check if can cancel
export function canCancel(serviceUsage: ServiceUsage): boolean {
  return serviceUsage.status !== "COMPLETED" && serviceUsage.status !== "CANCELLED";
}

// Helper function to get next valid statuses
export function getNextValidStatuses(currentStatus: ServiceUsageStatus): ServiceUsageStatus[] {
  return VALID_STATUS_TRANSITIONS[currentStatus] || [];
}
