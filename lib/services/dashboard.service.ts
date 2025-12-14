/**
 * Dashboard Service
 * API calls for dashboard data
 */

import { api } from "./api";
import type {
  DashboardStatsResponse,
  ArrivalsListResponse,
  DeparturesListResponse,
  RoomsListResponse,
  HousekeepingPendingResponse,
  RoomStatusData,
} from "@/lib/types/dashboard";
import type { Arrival } from "@/components/dashboard/arrivals-table";
import type { Departure } from "@/components/dashboard/departures-table";
import type { DashboardStats } from "@/lib/mock-dashboard";

// ============================================================================
// Dashboard API Endpoints
// ============================================================================

const ENDPOINTS = {
  DASHBOARD: "/reports/dashboard",
  ARRIVALS: "/reservations/arrivals",
  DEPARTURES: "/reservations/departures",
  ROOMS: "/rooms",
  HOUSEKEEPING_PENDING: "/housekeeping/pending",
} as const;

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get dashboard statistics
 * Endpoint: GET /v1/reports/dashboard
 */
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  return api.get<DashboardStatsResponse>(ENDPOINTS.DASHBOARD, {
    requiresAuth: true,
  });
}

/**
 * Get today's arrivals
 * Endpoint: GET /v1/reservations/arrivals
 */
export async function getTodayArrivals(): Promise<ArrivalsListResponse> {
  return api.get<ArrivalsListResponse>(ENDPOINTS.ARRIVALS, {
    requiresAuth: true,
  });
}

/**
 * Get today's departures
 * Endpoint: GET /v1/reservations/departures
 */
export async function getTodayDepartures(): Promise<DeparturesListResponse> {
  return api.get<DeparturesListResponse>(ENDPOINTS.DEPARTURES, {
    requiresAuth: true,
  });
}

/**
 * Get all rooms (to calculate room status counts)
 * Endpoint: GET /v1/rooms
 */
export async function getAllRooms(): Promise<RoomsListResponse> {
  return api.get<RoomsListResponse>(ENDPOINTS.ROOMS, {
    requiresAuth: true,
  });
}

/**
 * Get pending housekeeping rooms
 * Endpoint: GET /v1/housekeeping/pending
 */
export async function getHousekeepingPending(): Promise<HousekeepingPendingResponse> {
  return api.get<HousekeepingPendingResponse>(ENDPOINTS.HOUSEKEEPING_PENDING, {
    requiresAuth: true,
  });
}

// ============================================================================
// Data Transformation Functions
// ============================================================================

/**
 * Transform API stats response to UI DashboardStats format
 */
export function transformApiStatsToUI(
  apiStats: DashboardStatsResponse
): DashboardStats {
  return {
    totalRooms: apiStats.totalRooms,
    availableRooms: apiStats.availableRooms,
    dirtyRooms: apiStats.dirtyRooms,
    todayRevenue: apiStats.todayRevenue ?? 0,
    currentGuests: apiStats.currentGuests,
  };
}

/**
 * Transform API arrivals to UI Arrival format
 */
export function transformApiArrivalsToUI(
  apiArrivals: ArrivalsListResponse
): Arrival[] {
  return apiArrivals.results.map((arrival) => ({
    id: arrival.id.toString(),
    guestName: arrival.guestName || arrival.customerName || "Unknown Guest",
    roomNumber: arrival.roomNumber,
    roomType: arrival.roomTypeName,
    checkInTime: new Date(arrival.checkInDate),
    numberOfGuests: arrival.numberOfGuests,
  }));
}

/**
 * Transform API departures to UI Departure format
 */
export function transformApiDeparturesToUI(
  apiDepartures: DeparturesListResponse
): Departure[] {
  return apiDepartures.results.map((departure) => ({
    id: departure.id.toString(),
    guestName: departure.guestName || departure.customerName || "Unknown Guest",
    roomNumber: departure.roomNumber,
    roomType: departure.roomTypeName,
    checkOutTime: new Date(departure.checkOutDate),
    totalAmount: departure.totalAmount,
  }));
}

/**
 * Calculate room status data from rooms list
 */
export function calculateRoomStatusData(
  rooms: RoomsListResponse
): RoomStatusData[] {
  const statusCounts: Record<string, number> = {
    AVAILABLE: 0,
    RESERVED: 0,
    OCCUPIED: 0,
    CLEANING: 0,
    MAINTENANCE: 0,
    OUT_OF_ORDER: 0,
  };

  rooms.results.forEach((room) => {
    if (room.status in statusCounts) {
      statusCounts[room.status]++;
    }
  });

  const statusConfig: Array<{
    key: string;
    label: string;
    color: string;
  }> = [
    { key: "AVAILABLE", label: "Sẵn sàng", color: "bg-success-600" },
    { key: "OCCUPIED", label: "Đang thuê", color: "bg-error-600" },
    { key: "CLEANING", label: "Bẩn", color: "bg-warning-600" },
    { key: "MAINTENANCE", label: "Bảo trì", color: "bg-gray-600" },
    { key: "RESERVED", label: "Đã đặt", color: "bg-info-600" },
    { key: "OUT_OF_ORDER", label: "Hỏng", color: "bg-gray-400" },
  ];

  return statusConfig
    .map((config) => ({
      status: config.label,
      count: statusCounts[config.key],
      color: config.color,
    }))
    .filter((item) => item.count > 0);
}

// ============================================================================
// Composite Dashboard Data Fetcher
// ============================================================================

export interface DashboardData {
  stats: DashboardStats;
  roomStatusData: RoomStatusData[];
  arrivals: Arrival[];
  departures: Departure[];
  occupancyRate: number;
  arrivalsCount: number;
  departuresCount: number;
  roomsNeedingCleaning: number;
}

/**
 * Fetch all dashboard data in one call
 * This aggregates multiple API calls for the dashboard
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  // Fetch all data in parallel
  const [dashboardStats, arrivalsData, departuresData, roomsData] =
    await Promise.all([
      getDashboardStats(),
      getTodayArrivals(),
      getTodayDepartures(),
      getAllRooms(),
    ]);

  // Transform data for UI
  const stats = transformApiStatsToUI(dashboardStats);
  const arrivals = transformApiArrivalsToUI(arrivalsData);
  const departures = transformApiDeparturesToUI(departuresData);
  const roomStatusData = calculateRoomStatusData(roomsData);

  // Calculate derived values
  const occupancyRate =
    dashboardStats.occupancyRate ??
    (stats.totalRooms > 0
      ? ((stats.totalRooms - stats.availableRooms) / stats.totalRooms) * 100
      : 0);

  const roomsNeedingCleaning =
    roomStatusData.find((room) => room.status === "Bẩn")?.count ?? 0;

  return {
    stats,
    roomStatusData,
    arrivals,
    departures,
    occupancyRate,
    arrivalsCount: arrivals.length,
    departuresCount: departures.length,
    roomsNeedingCleaning,
  };
}
