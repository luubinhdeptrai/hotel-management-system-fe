/**
 * API Response Types
 * Generated from swagger.yml specification
 */

// ============================================================================
// Generic API Response Wrappers
// ============================================================================

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  code: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface Token {
  token: string;
  expires: string;
}

export interface AuthTokens {
  access: Token;
  refresh: Token;
}

// Customer Auth
export interface CustomerRegisterRequest {
  fullName: string;
  phone: string;
  password: string;
  email?: string;
  idNumber?: string;
  address?: string;
}

export interface CustomerLoginRequest {
  phone: string;
  password: string;
}

export interface CustomerAuthResponse {
  customer: {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
  };
  tokens: AuthTokens;
}

// Employee Auth
export interface EmployeeLoginRequest {
  username: string;
  password: string;
}

export interface EmployeeAuthResponse {
  employee: {
    id: string;
    name: string;
    username: string;
    role: EmployeeRole;
    updatedAt: string;
  };
  tokens: AuthTokens;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface RefreshTokensRequest {
  refreshToken: string;
}

export interface RefreshTokensResponse {
  tokens: AuthTokens;
}

export interface ForgotPasswordRequest {
  username?: string; // for employee
  phone?: string; // for customer
}

export interface ForgotPasswordResponse {
  resetPasswordToken: string;
}

export interface ResetPasswordRequest {
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// Employee Types
// ============================================================================

export type EmployeeRole = "ADMIN" | "RECEPTIONIST" | "HOUSEKEEPING" | "STAFF";

export interface Employee {
  id: string;
  name: string;
  username: string;
  role: EmployeeRole;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  name: string;
  username: string;
  password: string;
  role?: EmployeeRole;
}

export interface UpdateEmployeeRequest {
  name?: string;
  role?: EmployeeRole;
}

export interface GetEmployeesParams {
  search?: string;
  role?: EmployeeRole;
  page?: number;
  limit?: number;
  sortBy?: "name" | "username" | "role" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// Customer Types
// ============================================================================

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  idNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings: number;
    customerPromotions: number;
  };
}

export interface CreateCustomerRequest {
  fullName: string;
  phone: string;
  password: string;
  email?: string;
  idNumber?: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  fullName?: string;
  email?: string;
  idNumber?: string;
  address?: string;
}

export interface GetCustomersParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "fullName" | "phone" | "email" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// Room Types
// ============================================================================

export type RoomStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "OCCUPIED"
  | "CLEANING"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE";

export interface RoomTag {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    roomTypeTags: number;
  };
}

export interface RoomTypeTag {
  id: string;
  name: string;
  roomTypeId: string;
  roomTagId: string;
  roomTag: RoomTag;
}

export interface RoomType {
  id: string;
  name: string;
  capacity: number;
  totalBed: number;
  pricePerNight: string;
  roomTypeTags?: RoomTypeTag[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    rooms: number;
    bookingRooms: number;
  };
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  code: string;
  status: RoomStatus;
  roomTypeId: string;
  roomType?: RoomType;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookingRooms: number;
  };
}

export interface CreateRoomRequest {
  roomNumber: string;
  floor: number;
  code?: string;
  roomTypeId: string;
  status?: RoomStatus;
}

export interface UpdateRoomRequest {
  roomNumber?: string;
  floor?: number;
  code?: string;
  roomTypeId?: string;
  status?: RoomStatus;
}

export interface GetRoomsParams {
  search?: string;
  status?: RoomStatus;
  floor?: number;
  roomTypeId?: string;
  page?: number;
  limit?: number;
  sortBy?: "roomNumber" | "floor" | "status" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateRoomTypeRequest {
  name: string;
  capacity: number;
  totalBed: number;
  pricePerNight: number;
  tagIds?: string[];
}

export interface UpdateRoomTypeRequest {
  name?: string;
  capacity?: number;
  totalBed?: number;
  pricePerNight?: number;
  tagIds?: string[];
}

export interface GetRoomTypesParams {
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: "name" | "capacity" | "pricePerNight" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// Service Types
// ============================================================================

export interface Service {
  id: string;
  name: string;
  price: number; // Changed from string to number (parse Decimal from backend)
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    serviceUsages: number;
  };
}

export interface CreateServiceRequest {
  name: string;
  price: number;
  unit?: string;
  isActive?: boolean;
}

export interface UpdateServiceRequest {
  name?: string;
  price?: number;
  unit?: string;
  isActive?: boolean;
}

export interface GetServicesParams {
  search?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "unit" | "isActive" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// Booking Types
// ============================================================================

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "PARTIALLY_CHECKED_OUT"
  | "CHECKED_OUT"
  | "CANCELLED";

export type TransactionType =
  | "DEPOSIT"
  | "ROOM_CHARGE"
  | "SERVICE_CHARGE"
  | "REFUND"
  | "ADJUSTMENT";

export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "E_WALLET";

// Transaction Status
export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: "Chờ xử lý",
  COMPLETED: "Hoàn thành",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

export const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-blue-100 text-blue-800",
};

// Service Usage Status
export type ServiceUsageStatus =
  | "PENDING"
  | "TRANSFERRED"
  | "COMPLETED"
  | "CANCELLED";

export const SERVICE_USAGE_STATUS_LABELS: Record<ServiceUsageStatus, string> = {
  PENDING: "Chờ xử lý",
  TRANSFERRED: "Đã chuyển",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export const SERVICE_USAGE_STATUS_COLORS: Record<ServiceUsageStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  TRANSFERRED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

// Payment Method Labels
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Tiền mặt",
  CREDIT_CARD: "Thẻ tín dụng",
  BANK_TRANSFER: "Chuyển khoản",
  E_WALLET: "Ví điện tử",
};

// ============================================================================
// Booking Related Types
// ============================================================================

export interface CreateBookingRequest {
  customerId?: string;
  customer?: {
    fullName: string;
    phone: string;
    idNumber?: string;
    email?: string;
    address?: string;
  };
  rooms: Array<{
    roomId: string;
  }>;
  checkInDate: string; // ISO 8601 format
  checkOutDate: string; // ISO 8601 format
  totalGuests: number;
}

export interface CreateBookingResponse {
  bookingId: string;
  bookingCode: string;
  expiresAt: string;
  totalAmount: number;
}

// Check-in Request - matches backend CheckInPayload
export interface CheckInRequest {
  checkInInfo: Array<{
    bookingRoomId: string;
    customerIds: string[];
  }>;
}

// Check-out Request - matches backend CheckOutPayload
export interface CheckOutRequest {
  bookingRoomIds: string[];
}

export interface CreateTransactionRequest {
  bookingId: string;
  transactionType: TransactionType;
  amount: number;
  method: PaymentMethod;
  bookingRoomId?: string;
  transactionRef?: string;
  description?: string;
}

// Booking Room - represents individual room within a booking
export interface BookingRoom {
  id: string;
  bookingId: string;
  roomId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  pricePerNight: string;
  subtotalRoom: string;
  totalAmount: string;
  balance: string;
  status: BookingStatus;
  actualCheckIn?: string;
  actualCheckOut?: string;
  room?: Room;
  roomType?: RoomType;
  booking?: Booking;
  bookingCustomers?: BookingCustomer[];
}

// Booking Customer - represents customer assignment to booking/room
export interface BookingCustomer {
  id: string;
  bookingId: string;
  customerId: string;
  bookingRoomId?: string;
  isPrimary: boolean;
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

// Booking - main booking entity
export interface Booking {
  id: string;
  bookingCode: string;
  status: BookingStatus;
  primaryCustomerId: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalAmount: string;
  depositRequired: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
  primaryCustomer?: Customer;
  bookingRooms?: BookingRoom[];
  bookingCustomers?: BookingCustomer[];
  cancelledAt?: string;
  cancelReason?: string;
  confirmedAt?: string;
}

// ============================================================================
// Booking List & Filter Types
// ============================================================================

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  checkInDate?: string;
  checkOutDate?: string;
  roomTypeId?: string;
  search?: string;
  sortBy?: "createdAt" | "checkInDate" | "checkOutDate" | "status";
  sortOrder?: "asc" | "desc";
}

/**
 * Employee-initiated booking request
 * - Either customerId (existing customer) OR customer (new walk-in customer) required
 * - checkInDate/checkOutDate must be in ISO 8601 format (e.g., "2025-01-15T14:00:00.000Z")
 */
export interface CreateBookingEmployeeRequest {
  customerId?: string;
  customer?: {
    fullName: string;
    phone: string;
    idNumber?: string;
    email?: string;
    address?: string;
  };
  rooms: Array<{
    roomId: string;
  }>;
  checkInDate: string; // ISO 8601 format
  checkOutDate: string; // ISO 8601 format
  totalGuests: number;
  notes?: string;
}

/**
 * Update booking request - for modifying existing booking details
 * PUT /employee/bookings/{id}
 */
export interface UpdateBookingRequest {
  checkInDate?: string; // ISO 8601 format
  checkOutDate?: string; // ISO 8601 format
  totalGuests?: number;
  status?: BookingStatus;
}

export interface UpdateBookingResponse {
  id: string;
  bookingCode: string;
  status: BookingStatus;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  totalAmount: string;
  updatedAt: string;
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface CancelBookingResponse {
  id: string;
  bookingCode: string;
  status: "CANCELLED";
  cancelledAt: string;
  cancelReason?: string;
}

export interface ConfirmBookingResponse {
  id: string;
  bookingCode: string;
  status: "CONFIRMED";
  confirmedAt: string;
}

export interface AvailableRoomSearchParams {
  checkInDate: string;
  checkOutDate: string;
  roomTypeId?: string;
}

export interface AvailableRoom {
  id: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  roomType: RoomType;
}
