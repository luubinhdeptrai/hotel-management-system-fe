/**
 * Activity Type Definitions
 * Based on backend roommaster-be ActivityType enum
 */

export enum ActivityType {
  CREATE_BOOKING = "CREATE_BOOKING",
  UPDATE_BOOKING = "UPDATE_BOOKING",
  CREATE_BOOKING_ROOM = "CREATE_BOOKING_ROOM",
  UPDATE_BOOKING_ROOM = "UPDATE_BOOKING_ROOM",
  CREATE_SERVICE_USAGE = "CREATE_SERVICE_USAGE",
  UPDATE_SERVICE_USAGE = "UPDATE_SERVICE_USAGE",
  CREATE_TRANSACTION = "CREATE_TRANSACTION",
  UPDATE_TRANSACTION = "UPDATE_TRANSACTION",
  CREATE_CUSTOMER = "CREATE_CUSTOMER",
  UPDATE_CUSTOMER = "UPDATE_CUSTOMER",
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  CREATE_PROMOTION = "CREATE_PROMOTION",
  UPDATE_PROMOTION = "UPDATE_PROMOTION",
  CLAIM_PROMOTION = "CLAIM_PROMOTION",
  UPDATE_CUSTOMER_RANK = "UPDATE_CUSTOMER_RANK",
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;

  // Optional relations
  serviceUsageId?: string;
  bookingRoomId?: string;
  customerId?: string;
  employeeId?: string;

  // Relations (populated by backend)
  serviceUsage?: {
    id: string;
    serviceId?: string;
    quantity?: number;
  };
  bookingRoom?: {
    id: string;
    bookingId?: string;
    roomId?: string;
    status?: string;
  };
  customer?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    CCCD?: string;
  };
  employee?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface ActivityFilters {
  type?: ActivityType;
  customerId?: string;
  employeeId?: string;
  bookingRoomId?: string;
  serviceUsageId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ActivityListResponse {
  data: Activity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "type" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
