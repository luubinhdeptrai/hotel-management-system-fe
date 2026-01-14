// Room Status Enum (matches Backend)
export type RoomStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "OCCUPIED"
  | "CLEANING"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE";

// Display mapping
export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  AVAILABLE: "Sẵn sàng",
  RESERVED: "Đã đặt",
  OCCUPIED: "Đang thuê",
  CLEANING: "Đang dọn",
  MAINTENANCE: "Bảo trì",
  OUT_OF_SERVICE: "Ngưng hoạt động",
};

// Legacy support (optional, if UI relies on Vietnamese strings as values)
// export type RoomStatusLegacy = "Sẵn sàng" | ...

// Room Type
export interface RoomType {
  // Schema fields
  id: string;
  name: string;
  capacity: number;
  totalBed: number;
  basePrice: number; // Decimal -> number. was price
  imageUrl?: string | null;

  // Legacy / UI
  roomTypeID?: string;
  roomTypeName?: string;
  price?: number; // alias basePrice
  amenities?: string[];
  tags?: string[];
}

// Room
export interface Room {
  // Schema fields
  id: string;
  roomNumber: string;
  floor: number;
  createdAt: string;
  updatedAt: string;
  roomType: RoomType;
  pricePerNight?: string | number; // Optional as it might come from RoomType

  // Legacy / UI
  roomID?: string;
  roomName?: string; // alias roomNumber
  roomTypeID?: string;
  roomStatus?: RoomStatus; // or mapped display string?

  // Guest info (populated)
  guestName?: string;
  folioId?: string;
}

export interface RoomImage {
  id: string;
  url: string;
  isDefault: boolean;
  sortOrder: number;
  roomId: string; // Foreign key
  createdAt: string;
  updatedAt: string;
}

// Filter Options
export interface RoomFilterOptions {
  status: RoomStatus | "Tất cả";
  roomType: string | "Tất cả";
  floor: number | "Tất cả";
}
