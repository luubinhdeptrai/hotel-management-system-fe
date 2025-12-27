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

export interface RoomType {
  id: string;
  name: string;
  capacity: number;
  pricePerNight: string;
  amenities?: Record<string, unknown>;
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
  roomTypeId: string;
  status?: RoomStatus;
}

export interface UpdateRoomRequest {
  roomNumber?: string;
  floor?: number;
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
  pricePerNight: number;
  amenities?: Record<string, unknown>;
}

export interface UpdateRoomTypeRequest {
  name?: string;
  capacity?: number;
  pricePerNight?: number;
  amenities?: Record<string, unknown>;
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
  price: string;
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
  | "CHECKED_OUT"
  | "CANCELLED"
  | "EXPIRED";

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

// ============================================================================
// Booking Related Types
// ============================================================================

export interface RoomRequest {
  roomTypeId: string;
  count: number;
}

export interface CreateBookingRequest {
  rooms: Array<{
    roomTypeId: string;
    count: number;
  }>;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
}

export interface CreateBookingResponse {
  bookingId: string;
  bookingCode: string;
  expiresAt: string;
  totalAmount: number;
}

export interface CheckInRequest {
  bookingId: string;
  bookingRoomId: string;
  guests: Array<{
    customerId: string;
    isPrimary?: boolean;
  }>;
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
