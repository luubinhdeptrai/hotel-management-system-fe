// 2-Level Reservation Status System (per spec 2.5)

// Header Status (Booking level) - For the entire reservation
// Includes legacy values for backward compatibility
export type ReservationHeaderStatus =
  | "Chờ xác nhận" // PENDING - Waiting for deposit
  | "Đã xác nhận" // CONFIRMED - Deposit received
  | "Đã nhận phòng" // CHECKED_IN - Guest has checked in (at least 1 room)
  | "Trả phòng một phần" // PARTIALLY_CHECKED_OUT - Some rooms checked out (multi-room)
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
  "Trả phòng một phần": "🚪 Trả phòng một phần",
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

// Backend Booking Status Enum
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "PARTIALLY_CHECKED_OUT"
  | "CHECKED_OUT"
  | "CANCELLED";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã nhận phòng",
  PARTIALLY_CHECKED_OUT: "Trả phòng một phần",
  CHECKED_OUT: "Đã trả phòng",
  CANCELLED: "Đã hủy",
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
// Reservation Detail (Room in a Reservation)
export interface ReservationDetail {
  // Schema fields (BookingRoom)
  id: string; // was detailID
  bookingId: string; // was reservationID
  roomId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  pricePerNight: number;
  subtotalRoom?: number; // Backend field
  status?: BookingStatus; // Backend field

  // Legacy / UI
  detailID?: string;
  reservationID?: string;
  roomName: string; // Likely from relation
  roomTypeName: string; // Likely from relation

  detailStatus?: ReservationDetailStatus; // NEW: Per-room status (optional for backward compat)
  // status: ReservationStatus; // Conflict with schema status?
  // I'll keep generic status field type loose or union
  uiStatus?: ReservationStatus; // Renamed legacy? Or just keep "status" as union?

  numberOfGuests: number;
}

// Main Reservation
// Main Reservation
export interface Reservation {
  // Schema fields (Booking)
  id: string; // was reservationID
  bookingCode: string; // Schema says @unique, FE didn't have it?
  primaryCustomerId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  depositRequired: number; // vs depositAmount
  status: BookingStatus | ReservationStatus;

  // Relations
  details: ReservationDetail[];

  // Legacy / UI
  reservationID?: string;
  customerID?: string;
  customer?: Customer; // Computed / Relation
  reservationDate?: string; // maybe createdAt?
  totalRooms: number; // Computed
  depositAmount: number; // alias depositRequired?
  paidDeposit?: number;
  notes?: string; // Not in schema directly? Ah, schema has no notes on Booking? Wait.
  // Booking schema: id, bookingCode, status, primaryCustomerId, checkInDate, checkOutDate, totalGuests, totalAmount, depositRequired, createdAt, updatedAt.
  // NO notes field in Booking schema!

  headerStatus?: ReservationHeaderStatus;
  backendStatus?: string;
  backendData?: any;
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
  // Deposit confirmation fields
  depositConfirmed?: boolean;
  depositPaymentMethod?:
    | "CASH"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "BANK_TRANSFER";
  // Customer selection data for handling existing vs new customers
  customerSelection?: {
    useExisting: boolean;
    customerId?: string; // Only for existing customers
  };
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
