/**
 * Transaction Service
 * Handles all transaction-related API calls aligned with backend
 *
 * Backend Endpoints:
 * - POST /employee/transactions - Create transaction
 * - GET /employee/transactions - List transactions with filters
 * - GET /employee/transactions/{id} - Transaction details
 */

import { api } from "./api";
import type {
  ApiResponse,
  PaymentMethod,
  TransactionType,
  TransactionStatus,
  Customer,
  BookingRoom,
} from "@/lib/types/api";

// ============================================================================
// Transaction Types (matching backend)
// ============================================================================

export interface PromotionApplication {
  customerPromotionId: string;
  bookingRoomId?: string;
  serviceUsageId?: string;
}

export interface CreateTransactionRequest {
  bookingId?: string;
  bookingRoomIds?: string[];
  serviceUsageId?: string;
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  description?: string;
  promotionApplications?: PromotionApplication[];
}

export interface TransactionDetail {
  id: string;
  transactionId?: string;
  bookingRoomId?: string;
  serviceUsageId?: string;
  baseAmount: string;
  discountAmount: string;
  amount: string;
  createdAt: string;
  bookingRoom?: {
    id: string;
    room: { roomNumber: string; floor?: number };
    roomType?: { name: string };
  };
  serviceUsage?: {
    id: string;
    service: { name: string; price: number; unit: string };
    quantity: number;
  };
}

export interface Transaction {
  id: string;
  bookingId: string;
  type: TransactionType;
  status: TransactionStatus;
  method: PaymentMethod;
  baseAmount: string;
  discountAmount: string;
  amount: string;
  description?: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    bookingCode: string;
    primaryCustomer?: {
      id: string;
      fullName: string;
      phone: string;
    };
    bookingRooms?: BookingRoom[];
  };
  processedBy?: {
    id: string;
    name: string;
    username: string;
  };
  details?: TransactionDetail[];
  usedPromotions?: Array<{
    id: string;
    promotion: {
      code: string;
      description?: string;
    };
  }>;
}

export interface TransactionResponse {
  id: string;
  bookingId: string;
  type: TransactionType;
  status: TransactionStatus;
  method: PaymentMethod;
  amount: string;
  baseAmount: string;
  discountAmount: string;
  createdAt: string;
}

export interface GetTransactionsFilters {
  bookingId?: string;
  status?: TransactionStatus;
  type?: TransactionType;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface GetTransactionsOptions {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "occurredAt" | "amount";
  sortOrder?: "asc" | "desc";
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Transaction Service
// ============================================================================

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

export const transactionService = {
  /**
   * Create a transaction
   * POST /employee/transactions
   *
   * Backend auto-calculates amount based on:
   * - DEPOSIT: Minimum deposit percentage of booking
   * - ROOM_CHARGE: Total for specified rooms (or full booking)
   * - SERVICE_CHARGE: Service usage amount
   */
  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<TransactionResponse> {
    try {
      const response = await api.post<ApiResponse<TransactionResponse>>(
        "/employee/transactions",
        data,
        { requiresAuth: true }
      );
      const unwrappedData =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<TransactionResponse>).data
          : (response as unknown as TransactionResponse);
      return unwrappedData;
    } catch (error) {
      console.error("Create transaction failed:", error);
      throw error;
    }
  },

  /**
   * Get final bill for a booking (MOCK)
   * GET /employee/bookings/{bookingId}/bill (Endpoint does not exist)
   *
   * @deprecated Backend does not support bill calculation yet.
   * This returns a mock zero-value bill to prevent UI crashes.
   */
  async getBill(bookingId: string): Promise<BillResponse> {
    console.warn("getBill is a MOCK function. Backend endpoint missing.");
    // Return safe default structure
    return {
      bookingId,
      customerId: "",
      customerName: "",
      checkInDate: new Date().toISOString(),
      checkOutDate: new Date().toISOString(),
      nights: 0,
      roomCharges: 0,
      serviceCharges: 0,
      earlyCheckInFee: 0,
      lateCheckOutFee: 0,
      subtotal: 0,
      discounts: 0,
      totalAmount: 0,
      paidAmount: 0,
      remainingBalance: 0,
      breakdown: [],
    };
  },

  /**
   * Process refund for cancelled booking
   * Uses POST /employee/transactions with type=REFUND
   */
  async processRefund(data: RefundRequest): Promise<RefundResponse> {
    try {
      // Handle ORIGINAL_PAYMENT_METHOD case - default to CASH if specific method not provided
      // Backend transaction creation requires a concrete PaymentMethod enum
      const paymentMethod =
        data.refundMethod === "ORIGINAL_PAYMENT_METHOD" || !data.refundMethod
          ? "CASH"
          : data.refundMethod;

      const response = await this.createTransaction({
        bookingId: data.bookingId,
        paymentMethod: paymentMethod,
        transactionType: "REFUND",
        description: data.notes || "Refund processed",
      });

      // Map TransactionResponse to RefundResponse
      return {
        refundId: response.transactionId,
        bookingId: response.bookingId,
        amount: response.amount,
        refundMethod: response.paymentMethod,
        status: response.status,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Get transaction by ID failed:", error);
      throw error;
    }
  },

  /**
   * Get transactions for a specific booking
   * Convenience method that filters by bookingId
   */
  async getBookingTransactions(bookingId: string): Promise<Transaction[]> {
    try {
      const response = await this.getTransactions(
        { bookingId },
        { limit: 100, sortBy: "createdAt", sortOrder: "desc" }
      );
      return response.transactions;
    } catch (error) {
      console.error("Get booking transactions failed:", error);
      return [];
    }
  },
};
