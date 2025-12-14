/**
 * Dashboard Types
 * Types for dashboard data and statistics
 */

// ============================================================================
// Dashboard Stats Response from /reports/dashboard
// ============================================================================

/**
 * Dashboard statistics from the API
 * Endpoint: GET /v1/reports/dashboard
 */
export interface DashboardStatsResponse {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  dirtyRooms: number;
  maintenanceRooms: number;
  todayArrivals: number;
  todayDepartures: number;
  currentGuests: number;
  occupancyRate: number;
  todayRevenue?: number;
}

// ============================================================================
// Room Status Data for Charts
// ============================================================================

export interface RoomStatusData {
  status: string;
  count: number;
  color: string;
}

// ============================================================================
// Arrivals Response from /reservations/arrivals
// ============================================================================

/**
 * Arrival data from the API
 * Endpoint: GET /v1/reservations/arrivals
 */
export interface ArrivalResponse {
  id: number;
  reservationId: number;
  guestName: string;
  customerName?: string;
  roomNumber: string;
  roomTypeName: string;
  checkInDate: string;
  checkInTime?: string;
  numberOfGuests: number;
  specialRequests?: string;
  status: "PENDING" | "CONFIRMED";
}

export interface ArrivalsListResponse {
  results: ArrivalResponse[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// ============================================================================
// Departures Response from /reservations/departures
// ============================================================================

/**
 * Departure data from the API
 * Endpoint: GET /v1/reservations/departures
 */
export interface DepartureResponse {
  id: number;
  stayRecordId: number;
  guestName: string;
  customerName?: string;
  roomNumber: string;
  roomTypeName: string;
  checkOutDate: string;
  checkOutTime?: string;
  totalAmount: number;
  balance: number;
  status: "CHECKED_IN" | "DUE_OUT";
}

export interface DeparturesListResponse {
  results: DepartureResponse[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// ============================================================================
// Room Status Response from /rooms
// ============================================================================

export interface RoomResponse {
  id: number;
  code: string;
  name: string;
  floor: number;
  roomTypeId: number;
  status:
    | "AVAILABLE"
    | "RESERVED"
    | "OCCUPIED"
    | "CLEANING"
    | "MAINTENANCE"
    | "OUT_OF_ORDER";
  notes?: string;
  roomType?: {
    id: number;
    code: string;
    name: string;
  };
}

export interface RoomsListResponse {
  results: RoomResponse[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// ============================================================================
// Housekeeping Pending Response from /housekeeping/pending
// ============================================================================

export interface HousekeepingPendingRoom {
  id: number;
  roomId: number;
  roomCode: string;
  roomName: string;
  floor: number;
  status: "PENDING" | "IN_PROGRESS";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  assignedTo?: {
    id: number;
    name: string;
  };
  stayRecordId?: number;
  notes?: string;
}

export interface HousekeepingPendingResponse {
  results: HousekeepingPendingRoom[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}
