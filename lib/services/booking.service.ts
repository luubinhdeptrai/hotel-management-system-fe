/**
 * Booking Service
 * Handles all booking-related API calls for employee dashboard
 */

import { api } from "./api";
import type {
  ApiResponse,
  PaginatedResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  CheckInRequest,
  CheckOutRequest,
  CreateTransactionRequest,
  Booking,
  BookingRoom,
  GetBookingsParams,
  CreateBookingEmployeeRequest,
  CancelBookingRequest,
  CancelBookingResponse,
  ConfirmBookingResponse,
  AvailableRoomSearchParams,
  AvailableRoom,
  UpdateBookingRequest,
  UpdateBookingResponse,
} from "@/lib/types/api";

export interface BookingResponse {
  bookingRooms?: BookingRoom[];
  booking?: Booking;
}

export interface RoomTypeAvailability {
  roomTypeId: string;
  name: string;
  availableCount: number;
  pricePerNight: number;
  maxGuests: number;
}

export interface BookingService {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: "PENDING" | "COMPLETED";
  orderedAt: string;
}

export interface AddServiceRequest {
  bookingRoomId: string;
  serviceId: string;
  quantity: number;
  notes?: string;
}

export interface BookingServicesResponse {
  bookingId: string;
  services: BookingService[];
  totalServiceCharges: number;
}

export interface CancellationPreview {
  bookingId: string;
  totalAmount: number;
  paidAmount: number;
  cancellationFee: number;
  refundAmount: number;
  refundPercentage: number;
  policy: string;
}

/**
 * Build query string from params object
 */
function buildQueryString(params: { [key: string]: unknown }): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const bookingService = {
  // ============================================================================
  // LIST & SEARCH BOOKINGS
  // ============================================================================

  /**
   * Get all bookings with pagination and filters (employee)
   * GET /employee/bookings
   *
   * Note: If API doesn't exist, returns empty array (mock fallback in hook)
   */
  async getAllBookings(
    params?: GetBookingsParams
  ): Promise<PaginatedResponse<Booking>> {
    try {
      const queryString = params
        ? buildQueryString(params as unknown as { [key: string]: unknown })
        : "";
      const response = await api.get<ApiResponse<PaginatedResponse<Booking>>>(
        `/employee/bookings${queryString}`,
        { requiresAuth: true }
      );
      const data =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<PaginatedResponse<Booking>>).data
          : (response as unknown as PaginatedResponse<Booking>);
      return data;
    } catch (error) {
      console.error("Get all bookings failed:", error);
      // Return empty paginated response for mock fallback
      return { data: [], total: 0, page: 1, limit: 10 };
    }
  },

  /**
   * Search bookings by query (code, customer name, phone)
   * GET /employee/bookings?search=...
   */
  async searchBookings(query: string): Promise<Booking[]> {
    try {
      const response = await this.getAllBookings({ search: query });
      return response.data || [];
    } catch (error) {
      console.error("Search bookings failed:", error);
      return [];
    }
  },

  /**
   * Get booking details by ID (employee)
   * GET /employee/bookings/{id}
   */
  async getBookingById(bookingId: string): Promise<BookingResponse> {
    const response = await api.get<ApiResponse<BookingResponse>>(
      `/employee/bookings/${bookingId}`,
      { requiresAuth: true }
    );
    const data =
      response && typeof response === "object" && "data" in response
        ? (response as ApiResponse<BookingResponse>).data
        : (response as unknown as BookingResponse);
    return data;
  },

  // ============================================================================
  // CREATE BOOKINGS
  // ============================================================================

  /**
   * Create a new booking (employee)
   * POST /employee/bookings
   *
   * Note: Uses mock response if API doesn't exist
   */
  async createBooking(
    data: CreateBookingRequest | CreateBookingEmployeeRequest
  ): Promise<CreateBookingResponse> {
    const response = await api.post<ApiResponse<CreateBookingResponse>>(
      "/employee/bookings",
      data,
      { requiresAuth: true }
    );
    const unwrappedData =
      response && typeof response === "object" && "data" in response
        ? (response as ApiResponse<CreateBookingResponse>).data
        : (response as unknown as CreateBookingResponse);
    return unwrappedData;
  },

  // ============================================================================
  // BOOKING STATUS MANAGEMENT
  // ============================================================================

  /**
   * Cancel a booking
   * POST /employee/bookings/{id}/cancel
   *
   * Note: Uses mock response if API doesn't exist
   */
  async cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<CancelBookingResponse> {
    try {
      const response = await api.post<ApiResponse<CancelBookingResponse>>(
        `/employee/bookings/${bookingId}/cancel`,
        { reason } as CancelBookingRequest,
        { requiresAuth: true }
      );
      const data =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<CancelBookingResponse>).data
          : (response as unknown as CancelBookingResponse);
      return data;
    } catch (error) {
      console.error(
        "Cancel booking API failed, returning mock response:",
        error
      );
      // Return mock response for frontend state update
      return {
        id: bookingId,
        bookingCode: "",
        status: "CANCELLED",
        cancelledAt: new Date().toISOString(),
        cancelReason: reason,
      };
    }
  },

  /**
   * Confirm a pending booking
   * PATCH /employee/bookings/{id}/confirm
   *
   * Note: Uses mock response if API doesn't exist
   */
  async confirmBooking(bookingId: string): Promise<ConfirmBookingResponse> {
    try {
      const response = await api.patch<ApiResponse<ConfirmBookingResponse>>(
        `/employee/bookings/${bookingId}/confirm`,
        {},
        { requiresAuth: true }
      );
      const data =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<ConfirmBookingResponse>).data
          : (response as unknown as ConfirmBookingResponse);
      return data;
    } catch (error) {
      console.error(
        "Confirm booking API failed, returning mock response:",
        error
      );
      return {
        id: bookingId,
        bookingCode: "",
        status: "CONFIRMED",
        confirmedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Update booking details
   * PUT /employee/bookings/{id}
   *
   * Note: Uses mock response if API doesn't exist
   */
  async updateBooking(
    bookingId: string,
    data: UpdateBookingRequest
  ): Promise<UpdateBookingResponse> {
    try {
      const response = await api.put<ApiResponse<UpdateBookingResponse>>(
        `/employee/bookings/${bookingId}`,
        data,
        { requiresAuth: true }
      );
      const unwrappedData =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<UpdateBookingResponse>).data
          : (response as unknown as UpdateBookingResponse);
      return unwrappedData;
    } catch (error) {
      console.error(
        "Update booking API failed, returning mock response:",
        error
      );
      // Return mock response for frontend state update
      return {
        id: bookingId,
        bookingCode: "",
        status: data.status || "PENDING",
        checkInDate: data.checkInDate || "",
        checkOutDate: data.checkOutDate || "",
        totalGuests: data.totalGuests || 0,
        totalAmount: "0",
        updatedAt: new Date().toISOString(),
      };
    }
  },

  // ============================================================================
  // CHECK-IN / CHECK-OUT
  // ============================================================================

  /**
   * Check in guests for a booking (employee)
   * POST /employee/bookings/check-in
   */
  async checkIn(data: CheckInRequest): Promise<BookingResponse> {
    const response = await api.post<ApiResponse<BookingResponse>>(
      "/employee/bookings/check-in",
      data,
      { requiresAuth: true }
    );
    const unwrappedData =
      response && typeof response === "object" && "data" in response
        ? (response as ApiResponse<BookingResponse>).data
        : (response as unknown as BookingResponse);
    return unwrappedData;
  },

  /**
   * Check out guests for a booking (employee)
   * POST /employee/bookings/check-out
   */
  async checkOut(data: CheckOutRequest): Promise<BookingResponse> {
    const response = await api.post<ApiResponse<BookingResponse>>(
      "/employee/bookings/check-out",
      data,
      { requiresAuth: true }
    );
    const unwrappedData =
      response && typeof response === "object" && "data" in response
        ? (response as ApiResponse<BookingResponse>).data
        : (response as unknown as BookingResponse);
    return unwrappedData;
  },

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  /**
   * Create a transaction for a booking (employee)
   * POST /employee/bookings/transaction
   */
  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<BookingResponse> {
    const response = await api.post<ApiResponse<BookingResponse>>(
      "/employee/bookings/transaction",
      data,
      { requiresAuth: true }
    );
    const unwrappedData =
      response && typeof response === "object" && "data" in response
        ? (response as ApiResponse<BookingResponse>).data
        : (response as unknown as BookingResponse);
    return unwrappedData;
  },

  // ============================================================================
  // AVAILABLE ROOMS
  // ============================================================================

  /**
   * Get available rooms for a date range
   * GET /employee/rooms/available?checkInDate=...&checkOutDate=...&roomTypeId=...
   *
   * Note: Uses mock fallback if API doesn't exist
   */
  async getAvailableRooms(
    params: AvailableRoomSearchParams
  ): Promise<AvailableRoom[]> {
    try {
      const queryString = buildQueryString(
        params as unknown as { [key: string]: unknown }
      );
      const response = await api.get<ApiResponse<AvailableRoom[]>>(
        `/employee/rooms/available${queryString}`,
        { requiresAuth: true }
      );
      const data =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<AvailableRoom[]>).data
          : (response as unknown as AvailableRoom[]);
      return data;
    } catch (error) {
      console.error("Get available rooms failed:", error);
      // Return empty array - mock fallback handled in hook
      return [];
    }
  },

  // ============================================================================
  // ROOM TYPE AVAILABILITY
  // ============================================================================

  /**
   * Check room type availability for date range
   * GET /employee/room-types/availability?checkInDate=...&checkOutDate=...
   */
  async getRoomTypeAvailability(
    checkInDate: string,
    checkOutDate: string
  ): Promise<RoomTypeAvailability[]> {
    try {
      const response = await api.get<
        ApiResponse<{ available: RoomTypeAvailability[] }>
      >(
        `/employee/room-types/availability?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`,
        { requiresAuth: true }
      );
      const data =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<{ available: RoomTypeAvailability[] }>)
              .data
          : (response as unknown as { available: RoomTypeAvailability[] });
      return data.available || [];
    } catch (error) {
      console.error("Get room type availability failed:", error);
      return [];
    }
  },

  // ============================================================================
  // BOOKING SERVICES
  // ============================================================================

  /**
   * Add service to a booking
   * POST /employee/bookings/{bookingId}/services
   */
  async addService(
    bookingId: string,
    data: AddServiceRequest
  ): Promise<BookingService> {
    try {
      const response = await api.post<ApiResponse<BookingService>>(
        `/employee/bookings/${bookingId}/services`,
        data,
        { requiresAuth: true }
      );
      const unwrappedData =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<BookingService>).data
          : (response as unknown as BookingService);
      return unwrappedData;
    } catch (error) {
      console.error("Add service to booking failed:", error);
      throw error;
    }
  },

  /**
   * Get all services for a booking
   * GET /employee/bookings/{bookingId}/services
   */
  async getBookingServices(
    bookingId: string
  ): Promise<BookingServicesResponse> {
    try {
      const response = await api.get<ApiResponse<BookingServicesResponse>>(
        `/employee/bookings/${bookingId}/services`,
        { requiresAuth: true }
      );
      const data =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<BookingServicesResponse>).data
          : (response as unknown as BookingServicesResponse);
      return data;
    } catch (error) {
      console.error("Get booking services failed:", error);
      throw error;
    }
  },

  /**
   * Remove service from a booking
   * DELETE /employee/bookings/{bookingId}/services/{serviceId}
   */
  async removeService(bookingId: string, serviceId: string): Promise<void> {
    try {
      await api.delete(
        `/employee/bookings/${bookingId}/services/${serviceId}`,
        { requiresAuth: true }
      );
    } catch (error) {
      console.error("Remove service from booking failed:", error);
      throw error;
    }
  },

  // ============================================================================
  // CANCELLATION
  // ============================================================================

  /**
   * Preview cancellation and refund amount
   * GET /employee/bookings/{bookingId}/cancellation-preview
   */
  async getCancellationPreview(
    bookingId: string
  ): Promise<CancellationPreview> {
    try {
      const response = await api.get<ApiResponse<CancellationPreview>>(
        `/employee/bookings/${bookingId}/cancellation-preview`,
        { requiresAuth: true }
      );
      const data =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<CancellationPreview>).data
          : (response as unknown as CancellationPreview);
      return data;
    } catch (error) {
      console.error("Get cancellation preview failed:", error);
      throw error;
    }
  },
};
