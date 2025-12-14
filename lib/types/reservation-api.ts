/**
 * Reservation API Types
 * Types that match the backend API schema as documented in swaggerdoc.json
 */

// ============================================================================
// API Status Enums
// ============================================================================

/**
 * API Reservation Status (from swagger)
 * Maps to UI status labels
 */
export type ApiReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "CHECKED_IN"
  | "CHECKED_OUT";

// ============================================================================
// Request Types
// ============================================================================

/**
 * Create reservation request body
 * Endpoint: POST /v1/reservations
 */
export interface CreateReservationRequest {
  customerId: number;
  roomTypeId: number;
  checkInDate: string; // date format
  checkOutDate: string; // date format
  numberOfGuests: number;
  specialRequests?: string;
}

/**
 * Update reservation request body
 * Endpoint: PATCH /v1/reservations/{reservationId}
 */
export interface UpdateReservationRequest {
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  specialRequests?: string;
}

/**
 * Cancel reservation request body
 * Endpoint: POST /v1/reservations/{reservationId}/cancel
 */
export interface CancelReservationRequest {
  reason?: string;
}

/**
 * Check-in reservation request body
 * Endpoint: POST /v1/reservations/{reservationId}/check-in
 */
export interface CheckInReservationRequest {
  roomId?: number;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Customer data as returned by API
 */
export interface ApiCustomer {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tierId?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Room type data as returned by API
 */
export interface ApiRoomTypeRef {
  id: number;
  code: string;
  name: string;
  basePrice?: number;
  maxGuests?: number;
}

/**
 * Reservation as returned by API
 */
export interface ApiReservation {
  id: number;
  customerId: number;
  customer?: ApiCustomer;
  roomTypeId: number;
  roomType?: ApiRoomTypeRef;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  status: ApiReservationStatus;
  // Stay record info (available after check-in)
  stayRecordId?: number;
  roomId?: number;
  roomNumber?: string;
  // Financial info
  totalAmount?: number;
  depositAmount?: number;
  paidAmount?: number;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Paginated reservation list response
 */
export interface ReservationsListResponse {
  results: ApiReservation[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

/**
 * Parameters for listing reservations
 */
export interface ReservationListParams {
  page?: number;
  limit?: number;
  status?: ApiReservationStatus;
}

// ============================================================================
// Status Mapping Utilities
// ============================================================================

/**
 * Map API status to Vietnamese UI label
 */
export const API_STATUS_TO_UI: Record<ApiReservationStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  CHECKED_IN: "Đã nhận phòng",
  CHECKED_OUT: "Đã trả phòng",
};

/**
 * Map Vietnamese UI status to API status
 */
export const UI_STATUS_TO_API: Record<string, ApiReservationStatus> = {
  "Chờ xác nhận": "PENDING",
  "Đã xác nhận": "CONFIRMED",
  "Đã đặt": "CONFIRMED", // Legacy
  "Đã hủy": "CANCELLED",
  "Đã nhận phòng": "CHECKED_IN",
  "Đã nhận": "CHECKED_IN", // Legacy
  "Đã trả phòng": "CHECKED_OUT",
  "Không đến": "CANCELLED", // Map NO_SHOW to CANCELLED for API
};

/**
 * Get API status from UI status string
 */
export function getApiStatus(uiStatus: string): ApiReservationStatus {
  return UI_STATUS_TO_API[uiStatus] || "PENDING";
}

/**
 * Get UI status label from API status
 */
export function getUiStatus(apiStatus: ApiReservationStatus): string {
  return API_STATUS_TO_UI[apiStatus] || "Chờ xác nhận";
}
