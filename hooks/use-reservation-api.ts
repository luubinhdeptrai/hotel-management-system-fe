/**
 * Reservation API Hooks
 * React Query hooks for reservation API calls
 *
 * These hooks connect to the real backend API at localhost:3000/v1/reservations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  confirmReservation,
  cancelReservation,
  checkInReservation,
  getTodayArrivals,
  getTodayDepartures,
} from "@/lib/services/reservation.service";
import type {
  ApiReservation,
  ReservationListParams,
  CreateReservationRequest,
  UpdateReservationRequest,
  CancelReservationRequest,
  CheckInReservationRequest,
} from "@/lib/types/reservation-api";

// ============================================================================
// Query Keys
// ============================================================================

export const reservationKeys = {
  all: ["reservations"] as const,
  lists: () => [...reservationKeys.all, "list"] as const,
  list: (params: ReservationListParams) =>
    [...reservationKeys.lists(), params] as const,
  details: () => [...reservationKeys.all, "detail"] as const,
  detail: (id: number) => [...reservationKeys.details(), id] as const,
  arrivals: () => [...reservationKeys.all, "arrivals"] as const,
  departures: () => [...reservationKeys.all, "departures"] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all reservations with optional filters
 */
export function useReservationsQuery(params?: ReservationListParams) {
  return useQuery({
    queryKey: reservationKeys.list(params || {}),
    queryFn: () => getReservations(params),
  });
}

/**
 * Fetch a single reservation by ID
 */
export function useReservationQuery(reservationId: number | null) {
  return useQuery({
    queryKey: reservationKeys.detail(reservationId!),
    queryFn: () => getReservationById(reservationId!),
    enabled: reservationId !== null,
  });
}

/**
 * Fetch today's arrivals
 */
export function useTodayArrivalsQuery() {
  return useQuery({
    queryKey: reservationKeys.arrivals(),
    queryFn: getTodayArrivals,
  });
}

/**
 * Fetch today's departures
 */
export function useTodayDeparturesQuery() {
  return useQuery({
    queryKey: reservationKeys.departures(),
    queryFn: getTodayDepartures,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new reservation
 */
export function useCreateReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationRequest) => createReservation(data),
    onSuccess: () => {
      // Invalidate all reservation lists
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
    },
  });
}

/**
 * Update an existing reservation
 */
export function useUpdateReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reservationId,
      data,
    }: {
      reservationId: number;
      data: UpdateReservationRequest;
    }) => updateReservation(reservationId, data),
    onSuccess: (_, variables) => {
      // Invalidate all reservation lists and the specific detail
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(variables.reservationId),
      });
    },
  });
}

/**
 * Confirm a reservation
 */
export function useConfirmReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: number) => confirmReservation(reservationId),
    onSuccess: (_, reservationId) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(reservationId),
      });
      // Also update arrivals since status changed
      queryClient.invalidateQueries({ queryKey: reservationKeys.arrivals() });
    },
  });
}

/**
 * Cancel a reservation
 */
export function useCancelReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reservationId,
      data,
    }: {
      reservationId: number;
      data?: CancelReservationRequest;
    }) => cancelReservation(reservationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(variables.reservationId),
      });
      queryClient.invalidateQueries({ queryKey: reservationKeys.arrivals() });
    },
  });
}

/**
 * Check in a reservation
 */
export function useCheckInReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reservationId,
      data,
    }: {
      reservationId: number;
      data?: CheckInReservationRequest;
    }) => checkInReservation(reservationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(variables.reservationId),
      });
      // Update arrivals/departures as status changed
      queryClient.invalidateQueries({ queryKey: reservationKeys.arrivals() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.departures() });
      // Also invalidate rooms as one is now occupied
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

// ============================================================================
// Re-export types
// ============================================================================

export type { ApiReservation, ReservationListParams };
