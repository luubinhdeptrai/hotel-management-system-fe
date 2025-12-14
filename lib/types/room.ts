// ============================================================================
// API Room Status (from Swagger)
// ============================================================================
export type ApiRoomStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "OCCUPIED"
  | "CLEANING"
  | "MAINTENANCE"
  | "OUT_OF_ORDER";

// ============================================================================
// UI Room Status (Vietnamese labels)
// ============================================================================
// 🟢 Sẵn sàng (AVAILABLE) - Available for sale
// 🔴 Đang thuê (OCCUPIED) - Guest currently staying
// 🟡 Bẩn (CLEANING) - Guest checked out, needs cleaning
// 🧹 Đang dọn (CLEANING) - Currently being cleaned
// 🔍 Đang kiểm tra (INSPECTING) - Cleaned, awaiting supervisor inspection
// ⚫ Bảo trì (MAINTENANCE) - Under maintenance
// 🔵 Đã đặt (RESERVED) - Empty but assigned to upcoming booking
export type RoomStatus =
  | "Sẵn sàng"
  | "Đang thuê"
  | "Bẩn"
  | "Đang dọn"
  | "Đang kiểm tra"
  | "Bảo trì"
  | "Đã đặt";

// ============================================================================
// Status Mapping Utilities
// ============================================================================
export const API_TO_UI_STATUS: Record<ApiRoomStatus, RoomStatus> = {
  AVAILABLE: "Sẵn sàng",
  RESERVED: "Đã đặt",
  OCCUPIED: "Đang thuê",
  CLEANING: "Bẩn",
  MAINTENANCE: "Bảo trì",
  OUT_OF_ORDER: "Bảo trì",
};

export const UI_TO_API_STATUS: Record<RoomStatus, ApiRoomStatus> = {
  "Sẵn sàng": "AVAILABLE",
  "Đã đặt": "RESERVED",
  "Đang thuê": "OCCUPIED",
  Bẩn: "CLEANING",
  "Đang dọn": "CLEANING",
  "Đang kiểm tra": "CLEANING",
  "Bảo trì": "MAINTENANCE",
};

// ============================================================================
// API Types (from Swagger Schema)
// ============================================================================

/**
 * Room Type from API (swagger: RoomType)
 */
export interface ApiRoomType {
  id: number;
  code: string;
  name: string;
  baseCapacity: number;
  maxCapacity: number;
  amenities: string; // Comma-separated string
  rackRate: number;
  extraPersonFee: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Room from API (swagger: Room)
 */
export interface ApiRoom {
  id: number;
  code: string;
  name: string;
  floor: number;
  roomTypeId: number;
  status: ApiRoomStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  roomType?: ApiRoomType;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateRoomTypeRequest {
  code: string;
  name: string;
  basePrice: number;
  maxGuests: number;
  description?: string;
}

export interface UpdateRoomTypeRequest {
  name?: string;
  basePrice?: number;
  maxGuests?: number;
  description?: string;
}

export interface CreateRoomRequest {
  roomNumber: string;
  roomTypeId: number;
  floor: number;
  notes?: string;
}

export interface UpdateRoomRequest {
  roomNumber?: string;
  roomTypeId?: number;
  floor?: number;
  notes?: string;
}

export interface UpdateRoomStatusRequest {
  status: ApiRoomStatus;
}

export interface RoomAvailabilityParams {
  checkInDate: string;
  checkOutDate: string;
  roomTypeId?: number;
}

export interface RoomListParams {
  page?: number;
  limit?: number;
  roomTypeId?: number;
  status?: ApiRoomStatus;
}

// List response with pagination
export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export type RoomTypesListResponse = PaginatedResponse<ApiRoomType>;
export type RoomsListResponse = PaginatedResponse<ApiRoom>;

// ============================================================================
// UI Types (for backwards compatibility)
// ============================================================================

// Room Type (UI format)
export interface RoomType {
  roomTypeID: string;
  roomTypeName: string;
  price: number;
  capacity: number;
  amenities: string[];
}

// Room (UI format)
export interface Room {
  roomID: string;
  roomName: string;
  roomTypeID: string;
  roomType: RoomType;
  roomStatus: RoomStatus;
  floor: number;
  // Guest name when room is occupied
  guestName?: string;
  // Folio ID when room is occupied (for linking to Folio detail)
  folioId?: string;
}

// Filter Options
export interface RoomFilterOptions {
  status: RoomStatus | "Tất cả";
  roomType: string | "Tất cả";
  floor: number | "Tất cả";
}

// ============================================================================
// Transformation Utilities
// ============================================================================

/**
 * Transform API RoomType to UI RoomType
 */
export function transformApiRoomTypeToUI(apiRoomType: ApiRoomType): RoomType {
  return {
    roomTypeID: apiRoomType.code,
    roomTypeName: apiRoomType.name,
    price: apiRoomType.rackRate,
    capacity: apiRoomType.maxCapacity,
    amenities: apiRoomType.amenities
      ? apiRoomType.amenities.split(",").map((a) => a.trim())
      : [],
  };
}

/**
 * Transform API Room to UI Room
 */
export function transformApiRoomToUI(apiRoom: ApiRoom): Room {
  return {
    roomID: apiRoom.code,
    roomName: apiRoom.name,
    roomTypeID: apiRoom.roomType?.code || "",
    roomType: apiRoom.roomType
      ? transformApiRoomTypeToUI(apiRoom.roomType)
      : {
          roomTypeID: "",
          roomTypeName: "",
          price: 0,
          capacity: 0,
          amenities: [],
        },
    roomStatus: API_TO_UI_STATUS[apiRoom.status] || "Sẵn sàng",
    floor: apiRoom.floor,
  };
}
