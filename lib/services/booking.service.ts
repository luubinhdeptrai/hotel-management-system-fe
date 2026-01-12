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
   * Backend constraints:
   * - Cannot cancel if status = CANCELLED (already cancelled)
   * - Cannot cancel if status = CHECKED_IN (guest already checked in)
   * - Cannot cancel if status = CHECKED_OUT (booking already completed)
   * - Can only cancel if status = PENDING or CONFIRMED
   *
   * Backend does NOT accept 'reason' parameter - it's ignored.
   * Validation should be done in FE before calling this API.
   */
  async cancelBooking(
    bookingId: string
  ): Promise<CancelBookingResponse> {
    try {
      const response = await api.post<ApiResponse<CancelBookingResponse>>(
        `/employee/bookings/${bookingId}/cancel`,
        {}, // Backend expects empty body - no reason parameter
        { requiresAuth: true }
      );
      const data =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<CancelBookingResponse>).data
          : (response as unknown as CancelBookingResponse);
      return data;
    } catch (error) {
      console.error(
        "Cancel booking API failed:",
        error
      );
      throw error; // Don't silently return mock - let caller handle error
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
        status: "PENDING", // Default status - actual status managed by system
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
  // AVAILABLE ROOMS
  // =============================================================================

  /**
   * Get available rooms for a date range
   * GET /employee/rooms/available?checkInDate=...&checkOutDate=...&roomTypeId=...
   *
   * Note: Uses mock fallback if API doesn't exist
   * Always returns array (never returns object)
   */
  async getAvailableRooms(
    params: AvailableRoomSearchParams
  ): Promise<AvailableRoom[]> {
    try {
      const queryString = buildQueryString(
        params as unknown as { [key: string]: unknown }
      );
      console.log("📤 Calling API with query:", queryString);
      const response = await api.get<any>(
        `/employee/rooms/available${queryString}`,
        { requiresAuth: true }
      );
      
      console.log("📥 Raw API response:", JSON.stringify(response, null, 2));
      
      let data: AvailableRoom[] = [];
      
      // BE returns { data: { data: [...grouped rooms...], total, page, limit, ... } }
      if (!response) {
        console.warn("Response is null or undefined");
        return [];
      }

      // Navigate through nested structure
      let groupedArray: any[] | null = null;
      
      // Try first unwrap: response.data
      if (response && typeof response === "object" && "data" in response) {
        const firstUnwrap = response.data;
        console.log("After first unwrap (response.data):", firstUnwrap);
        
        // Try second unwrap: response.data.data
        if (firstUnwrap && typeof firstUnwrap === "object" && "data" in firstUnwrap) {
          groupedArray = firstUnwrap.data;
          console.log("After second unwrap (response.data.data):", groupedArray);
        } else if (Array.isArray(firstUnwrap)) {
          groupedArray = firstUnwrap;
          console.log("First unwrap is already array");
        }
      } else if (Array.isArray(response)) {
        groupedArray = response;
        console.log("Response is already array");
      }
      
      if (groupedArray && Array.isArray(groupedArray)) {
        data = this.flattenGroupedRooms(groupedArray);
      } else {
        console.warn("Could not extract array from response");
      }
      
      console.log("✅ Final flattened rooms count:", data.length);
      return data;
    } catch (error) {
      console.error("❌ Get available rooms failed:", error);
      return [];
    }
  },

  /**
   * Flatten grouped rooms response from BE
   * BE returns: [{ roomType, availableCount, rooms: [...] }, ...]
   * FE needs: [room1, room2, ...]
   */
  flattenGroupedRooms(data: any[]): AvailableRoom[] {
    if (!Array.isArray(data)) {
      console.warn("flattenGroupedRooms received non-array:", data);
      return [];
    }

    const flattened: AvailableRoom[] = [];
    
    data.forEach((group, idx) => {
      console.log(`Processing group ${idx}:`, group);
      // Check if this is a grouped response
      if (group && group.rooms && Array.isArray(group.rooms)) {
        console.log(`  - Found grouped format with ${group.rooms.length} rooms`);
        // Grouped format - add roomType to each room
        group.rooms.forEach((room: any) => {
          flattened.push({
            ...room,
            roomType: group.roomType
          } as AvailableRoom);
        });
      } else if (group && group.id && group.roomNumber) {
        console.log(`  - Found flat format room: ${group.roomNumber}`);
        // Flat format - just a room object
        flattened.push(group as AvailableRoom);
      } else {
        console.warn(`  - Skipped unrecognized group format at index ${idx}:`, group);
      }
    });

    return flattened;
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
   *
   * NOTE: This endpoint does NOT exist in Backend.
   * Backend has NO cancellation policy, penalty, or refund calculation.
   * Cancellation is simple: just changes status to CANCELLED and releases rooms.
   * This function is kept for backward compatibility but will throw error.
   */
  async getCancellationPreview(
    bookingId: string
  ): Promise<CancellationPreview> {
    // Backend does not provide this endpoint
    throw new Error("Cancellation preview is not supported by Backend. Backend does not have cancellation policy or refund calculation.");
  },

  // ============================================================================
  // ROOM TRANSFER (CHANGE ROOM)
  // ============================================================================

  /**
   * Change room for a checked-in booking room
   * POST /employee/bookings/rooms/{bookingRoomId}/change-room
   * 
   * Business Rules (enforced by Backend):
   * - Booking room must be CHECKED_IN status
   * - New room must be different from current room
   * - New room must be available for remaining stay period
   * - New room status must not be CLEANING or OCCUPIED
   * - Price adjustment calculated for remaining nights
   * - Old room status recalculated (AVAILABLE or RESERVED)
   * - New room status set to OCCUPIED
   * - Activity log created automatically
   * 
   * @param bookingRoomId - The booking room ID to transfer
   * @param data - Change room request data (newRoomId, optional reason)
   * @returns Updated booking room with price adjustment details
   */
  async changeRoom(
    bookingRoomId: string,
    data: { newRoomId: string; reason?: string }
  ): Promise<{ bookingRoom: BookingRoom; priceAdjustment: { oldPricePerNight: number; newPricePerNight: number; remainingNights: number; priceDifference: number } }> {
    try {
      const response = await api.post<ApiResponse<{ bookingRoom: BookingRoom; priceAdjustment: any }>>(
        `/employee/bookings/rooms/${bookingRoomId}/change-room`,
        data,
        { requiresAuth: true }
      );
      const unwrappedData =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<{ bookingRoom: BookingRoom; priceAdjustment: any }>).data
          : (response as unknown as { bookingRoom: BookingRoom; priceAdjustment: any });
      return unwrappedData;
    } catch (error) {
      console.error("Change room failed:", error);
      throw error;
    }
  },
};
