/**
 * Booking Service
 * Handles all booking-related API calls
 */

import { api } from "./api";
import type {
  ApiResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  CheckInRequest,
  CheckOutRequest,
  CreateTransactionRequest,
  Booking,
  BookingRoom,
} from "@/lib/types/api";

export interface BookingResponse {
  bookingRooms?: BookingRoom[];
  booking?: Booking;
}

export const bookingService = {
  /**
   * Create a new booking (customer)
   * POST /customer/bookings
   */
  async createBooking(
    data: CreateBookingRequest
  ): Promise<CreateBookingResponse> {
    const response = await api.post<ApiResponse<CreateBookingResponse>>(
      "/customer/bookings",
      data,
      { requiresAuth: true }
    );
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

  /**
   * Get booking details by ID
   * GET /customer/bookings/{id} or /employee/bookings/{id}
   */
  async getBookingById(
    bookingId: string,
    isEmployee = false
  ): Promise<BookingResponse> {
    const endpoint = isEmployee
      ? `/employee/bookings/${bookingId}`
      : `/customer/bookings/${bookingId}`;

    const response = await api.get<ApiResponse<BookingResponse>>(endpoint, {
      requiresAuth: true,
    });
    const data = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return data;
  },

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
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
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
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

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
    const unwrappedData = (response && typeof response === "object" && "data" in response)
      ? (response as any).data
      : response;
    return unwrappedData;
  },

  /**
   * Search bookings by query (code, customer name, phone)
   * GET /employee/bookings/search?q=...
   */
  async searchBookings(query: string): Promise<Booking[]> {
    try {
      const response = await api.get<ApiResponse<Booking[]>>(
        `/employee/bookings/search?q=${encodeURIComponent(query)}`,
        { requiresAuth: true }
      );
      return response.data || [];
    } catch (error) {
      console.error("Search bookings failed:", error);
      return [];
    }
  },

  /**
   * Get all bookings (employee)
   * GET /employee/bookings
   */
  async getAllBookings(): Promise<Booking[]> {
    try {
      const response = await api.get<ApiResponse<Booking[]>>(
        "/employee/bookings",
        { requiresAuth: true }
      );
      return response.data || [];
    } catch (error) {
      console.error("Get all bookings failed:", error);
      return [];
    }
  },
};
