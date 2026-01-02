// 2-Level Reservation Status System (per spec 2.5)

// Header Status (Booking level) - For the entire reservation
// Includes legacy values for backward compatibility
export type ReservationHeaderStatus =
  | "Chờ xác nhận" // PENDING - Waiting for deposit
  | "Đã xác nhận" // CONFIRMED - Deposit received
  | "Đã nhận phòng" // CHECKED_IN - Guest has checked in (at least 1 room)
  | "Đã trả phòng" // CHECKED_OUT - Guest has checked out (all rooms)
  | "Đã hủy" // CANCELLED - Reservation cancelled
  | "Không đến" // NO_SHOW - Guest didn't show up
  // Legacy values for backward compatibility
  | "Đã đặt" // Legacy: same as CONFIRMED
  | "Đã nhận"; // Legacy: same as CHECKED_IN

// Detail Status (Per-room) - For each room in multi-room bookings
export type ReservationDetailStatus =
  | "Chờ nhận" // WAITING - Room not yet checked in
  | "Đã nhận" // CHECKED_IN - Room checked in
  | "Đã trả" // CHECKED_OUT - Room checked out
  | "Hủy"; // CANCELLED - This room cancelled

// Labels for display (includes legacy values)
export const HEADER_STATUS_LABELS: Record<ReservationHeaderStatus, string> = {
  "Chờ xác nhận": "⏳ Chờ xác nhận",
  "Đã xác nhận": "✅ Đã xác nhận",
  "Đã nhận phòng": "🏨 Đã nhận phòng",
  "Đã trả phòng": "🚪 Đã trả phòng",
  "Đã hủy": "❌ Đã hủy",
  "Không đến": "⚠️ Không đến",
  // Legacy values
  "Đã đặt": "✅ Đã đặt",
  "Đã nhận": "🏨 Đã nhận",
};

export const DETAIL_STATUS_LABELS: Record<ReservationDetailStatus, string> = {
  "Chờ nhận": "⏳ Chờ nhận",
  "Đã nhận": "✅ Đã nhận",
  "Đã trả": "🚪 Đã trả",
  Hủy: "❌ Hủy",
};

// Legacy type alias for backward compatibility
export type ReservationStatus = ReservationHeaderStatus;

// Customer Information
export interface Customer {
  customerID: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  identityCard: string;
  address?: string;
}

// Reservation Detail (Room in a Reservation)
export interface ReservationDetail {
  detailID: string;
  reservationID: string;
  roomID: string;
  roomName: string;
  roomTypeID: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  detailStatus?: ReservationDetailStatus; // NEW: Per-room status (optional for backward compat)
  status: ReservationStatus; // Required for backward compatibility
  numberOfGuests: number;
  pricePerNight: number;
}

// Main Reservation
export interface Reservation {
  reservationID: string;
  customerID: string;
  customer: Customer;
  reservationDate: string;
  totalRooms: number;
  totalAmount: number;
  depositAmount: number;
  paidDeposit?: number; // NEW: Actual deposit paid
  notes?: string;
  headerStatus?: ReservationHeaderStatus; // NEW: Booking-level status (optional for backward compat)
  status: ReservationStatus; // Required for backward compatibility
  details: ReservationDetail[];
}

// Room Type Selection for multi-room booking
export interface RoomTypeSelection {
  roomTypeID: string;
  roomTypeName: string;
  quantity: number; // Number of rooms of this type
  numberOfGuests: number; // Guests per room
  pricePerNight: number;
  checkInDate: string; // NEW: Each room selection can have its own check-in date
  checkOutDate: string; // NEW: Each room selection can have its own check-out date
  roomID?: string; // NEW: Optional - specific room selected by user
}

// Reservation Form Data
export interface ReservationFormData {
  customerName: string;
  phoneNumber: string;
  email?: string;
  identityCard: string;
  address?: string;
  checkInDate: string;
  checkOutDate: string;
  // Legacy single room booking (for backward compatibility)
  roomTypeID?: string;
  numberOfGuests?: number;
  // New multi-room booking
  roomSelections?: RoomTypeSelection[];
  depositAmount: number;
  notes?: string;
}

// Available Room Search
export interface AvailableRoomSearchParams {
  checkInDate: string;
  checkOutDate: string;
  roomTypeID?: string;
  numberOfGuests?: number;
}

// Calendar Event for Timeline View
export interface ReservationEvent {
  id: string;
  reservationID: string;
  roomID: string;
  roomName: string;
  customerName: string;
  start: Date;
  end: Date;
  status: ReservationStatus;
  numberOfGuests: number;
}
