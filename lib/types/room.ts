// Room Status Types (7 statuses including housekeeping workflow)
// 🟢 Sẵn sàng (READY) - Available for sale
// 🔴 Đang thuê (OCCUPIED) - Guest currently staying
// 🟡 Bẩn (DIRTY) - Guest checked out, needs cleaning
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

// Room Type
export interface RoomType {
  roomTypeID: string;
  roomTypeName: string;
  price: number;
  capacity: number;
  amenities?: string[];
  imageUrl?: string;
  totalBed?: number;
  tags?: string[];
}

// Room
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
