// Check-in/Check-out Status Types
export type RentalStatus = "Đang thuê" | "Đã thanh toán" | "Quá hạn";

// Service/Penalty Types
export interface Service {
  serviceID: string;
  serviceName: string;
  category: string;
  price: number; // Changed from string to number for calculations
}

export interface Penalty {
  penaltyID: string;
  description: string;
  amount: number;
}

// Rental Receipt (Phiếu thuê phòng)
export interface RentalReceipt {
  receiptID: string;
  reservationID: string;
  roomID: string;
  roomName: string;
  roomTypeName: string;
  customerName: string;
  phoneNumber: string;
  identityCard: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  pricePerNight: number;
  totalNights: number;
  roomTotal: number;
  status: RentalStatus;
}

// Service/Penalty Detail for Check-out
export interface ServiceDetail {
  detailID: string;
  serviceID: string;
  serviceName: string;
  quantity: number;
  price: number; // Changed from string to number
  total: number; // Changed from string to number
  totalPaid?: number; // Added for payment tracking
  balance?: number; // Added for payment tracking (total - totalPaid)
  status?: string; // Service usage status
  dateUsed: string;
}

export interface PenaltyDetail {
  penaltyID: string;
  description: string;
  amount: number;
  dateIssued: string;
}

export interface SurchargeDetail {
  surchargeID: string;
  surchargeName: string;
  rate: number; // Percentage (e.g., 10 = 10%)
  amount: number;
  description?: string;
  dateApplied: string;
}

// Check-out Summary
export interface CheckoutSummary {
  receiptID: string;
  receipt: RentalReceipt;
  services: ServiceDetail[];
  penalties: PenaltyDetail[];
  surcharges: SurchargeDetail[];
  roomTotal: number;
  servicesTotal: number;
  penaltiesTotal: number;
  surchargesTotal: number;
  grandTotal: number;
}

// Check-in Form Data - Updated to match backend structure
export interface CheckInFormData {
  reservationID: string; // For UI compatibility, maps to bookingId
  bookingId: string; // Backend bookingId
  checkInInfo: Array<{
    bookingRoomId: string;
    customerIds: string[];
  }>;
  notes?: string;
}

// Backend-compatible Check-In Request
export interface BackendCheckInRequest {
  checkInInfo: Array<{
    bookingRoomId: string;
    customerIds: string[];
  }>;
}

// Check-out Form Data - Updated to match backend structure
export interface CheckOutFormData {
  bookingRoomIds: string[];
  notes?: string;
}

// Multi-room Check-in Form Data (Legacy - for backwards compatibility)
export interface MultiRoomCheckInFormData {
  reservationID: string;
  rooms: {
    detailID: string; // Reservation detail ID
    roomID: string; // Selected room ID
    numberOfGuests: number;
  }[];
  notes?: string;
}

// Walk-in (Guest without reservation) Form Data
export interface WalkInFormData {
  customerName: string;
  phoneNumber: string;
  identityCard: string;
  email?: string;
  address?: string;
  rooms: Array<{
    roomTypeId: string;
    count: number;
  }>;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  notes?: string;
}

// Add Service Form Data
export interface AddServiceFormData {
  serviceID: string;
  quantity: number;
  notes?: string;
}

// Add Penalty Form Data
export interface AddPenaltyFormData {
  description: string;
  amount: number;
  notes?: string;
}

// ============================================================================
// API Types (from swagger.json)
// ============================================================================

/**
 * Service Usage Request
 * POST /employee-api/v1/service/service-usage
 */
export interface ServiceUsageRequest {
  bookingId?: string; // Optional for guest services
  bookingRoomId?: string;
  serviceId: string;
  quantity: number;
}

/**
 * Service Usage Response
 */
export interface ServiceUsageResponse {
  id: string;
  bookingId?: string;
  bookingRoomId?: string;
  serviceId: string;
  quantity: number;
  unitPrice: number; // Added for price tracking
  totalPrice: number; // Changed from string to number
  totalPaid: number; // Added for payment tracking
  balance: number; // Added (totalPrice - totalPaid)
  status: "PENDING" | "TRANSFERRED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    name: string;
    price: number; // Changed from string to number
    unit: string;
  };
}

/**
 * Update Service Usage Request
 * PATCH /employee-api/v1/service/service-usage/{id}
 */
export interface UpdateServiceUsageRequest {
  quantity?: number;
  status?: "PENDING" | "TRANSFERRED" | "COMPLETED" | "CANCELLED";
}

// ============================================================================
// Walk-in Booking Types (Missing API - documented in Missing_API_endpoints.md)
// ============================================================================

/**
 * Walk-in Booking Request
 * POST /employee/bookings/walk-in
 */
export interface WalkInBookingRequest {
  customer: {
    fullName: string;
    phone: string;
    idNumber?: string;
    email?: string;
    address?: string;
  };
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  notes?: string;
}

/**
 * Walk-in Booking Response
 */
export interface WalkInBookingResponse {
  bookingId: string;
  bookingCode: string;
  bookingRoomId: string;
  status: "CHECKED_IN";
  message?: string;
}
