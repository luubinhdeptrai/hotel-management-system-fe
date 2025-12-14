/**
 * Reservation Service
 * API calls for reservation management
 * Based on swagger documentation endpoints under /reservations
 */

import { api } from "./api";
import type {
  ApiReservation,
  ReservationsListResponse,
  ReservationListParams,
  CreateReservationRequest,
  UpdateReservationRequest,
  CancelReservationRequest,
  CheckInReservationRequest,
} from "@/lib/types/reservation-api";

// ============================================================================
// API Endpoints
// ============================================================================

const ENDPOINTS = {
  // Reservations
  RESERVATIONS: "/reservations",
  RESERVATION_BY_ID: (id: number) => `/reservations/${id}`,
  RESERVATION_ARRIVALS: "/reservations/arrivals",
  RESERVATION_DEPARTURES: "/reservations/departures",

  // Reservation Actions
  CONFIRM: (id: number) => `/reservations/${id}/confirm`,
  CANCEL: (id: number) => `/reservations/${id}/cancel`,
  CHECK_IN: (id: number) => `/reservations/${id}/check-in`,
} as const;

// ============================================================================
// Reservation API Functions
// ============================================================================

/**
 * Get all reservations
 * Endpoint: GET /v1/reservations
 *
 * @param params - pagination and filter parameters
 */
export async function getReservations(
  params?: ReservationListParams
): Promise<ReservationsListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);

  const query = queryParams.toString();
  const endpoint = query
    ? `${ENDPOINTS.RESERVATIONS}?${query}`
    : ENDPOINTS.RESERVATIONS;

  return api.get<ReservationsListResponse>(endpoint, {
    requiresAuth: true,
  });
}

/**
 * Get reservation by ID
 * Endpoint: GET /v1/reservations/{reservationId}
 *
 * @param reservationId - reservation ID
 */
export async function getReservationById(
  reservationId: number
): Promise<ApiReservation> {
  return api.get<ApiReservation>(ENDPOINTS.RESERVATION_BY_ID(reservationId), {
    requiresAuth: true,
  });
}

/**
 * Create a new reservation
 * Endpoint: POST /v1/reservations
 *
 * @param data - reservation creation data
 */
export async function createReservation(
  data: CreateReservationRequest
): Promise<ApiReservation> {
  return api.post<ApiReservation>(ENDPOINTS.RESERVATIONS, data, {
    requiresAuth: true,
  });
}

/**
 * Update an existing reservation
 * Endpoint: PATCH /v1/reservations/{reservationId}
 *
 * @param reservationId - reservation ID
 * @param data - reservation update data
 */
export async function updateReservation(
  reservationId: number,
  data: UpdateReservationRequest
): Promise<ApiReservation> {
  return api.patch<ApiReservation>(
    ENDPOINTS.RESERVATION_BY_ID(reservationId),
    data,
    {
      requiresAuth: true,
    }
  );
}

/**
 * Confirm a reservation
 * Endpoint: POST /v1/reservations/{reservationId}/confirm
 *
 * @param reservationId - reservation ID
 */
export async function confirmReservation(
  reservationId: number
): Promise<ApiReservation> {
  return api.post<ApiReservation>(
    ENDPOINTS.CONFIRM(reservationId),
    {},
    {
      requiresAuth: true,
    }
  );
}

/**
 * Cancel a reservation
 * Endpoint: POST /v1/reservations/{reservationId}/cancel
 *
 * @param reservationId - reservation ID
 * @param data - cancellation reason (optional)
 */
export async function cancelReservation(
  reservationId: number,
  data?: CancelReservationRequest
): Promise<ApiReservation> {
  return api.post<ApiReservation>(ENDPOINTS.CANCEL(reservationId), data || {}, {
    requiresAuth: true,
  });
}

/**
 * Check in a reservation
 * Endpoint: POST /v1/reservations/{reservationId}/check-in
 *
 * @param reservationId - reservation ID
 * @param data - check-in data with optional room assignment
 */
export async function checkInReservation(
  reservationId: number,
  data?: CheckInReservationRequest
): Promise<ApiReservation> {
  return api.post<ApiReservation>(
    ENDPOINTS.CHECK_IN(reservationId),
    data || {},
    {
      requiresAuth: true,
    }
  );
}

// ============================================================================
// Arrivals & Departures
// ============================================================================

/**
 * Get today's arrivals
 * Endpoint: GET /v1/reservations/arrivals
 */
export async function getTodayArrivals(): Promise<ReservationsListResponse> {
  return api.get<ReservationsListResponse>(ENDPOINTS.RESERVATION_ARRIVALS, {
    requiresAuth: true,
  });
}

/**
 * Get today's departures
 * Endpoint: GET /v1/reservations/departures
 */
export async function getTodayDepartures(): Promise<ReservationsListResponse> {
  return api.get<ReservationsListResponse>(ENDPOINTS.RESERVATION_DEPARTURES, {
    requiresAuth: true,
  });
}

// ============================================================================
// Re-export types for convenience
// ============================================================================

export type {
  ApiReservation,
  ApiReservationStatus,
  ReservationsListResponse,
  ReservationListParams,
  CreateReservationRequest,
  UpdateReservationRequest,
  CancelReservationRequest,
  CheckInReservationRequest,
} from "@/lib/types/reservation-api";

export { getApiStatus, getUiStatus } from "@/lib/types/reservation-api";
