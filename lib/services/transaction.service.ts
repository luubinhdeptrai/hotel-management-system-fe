/**
 * Transaction Service
 * Handles all transaction-related API calls (deposits, payments, refunds)
 */

import { api } from "./api";
import type {
  ApiResponse,
  PaymentMethod,
  TransactionType,
  Transaction,
  GetTransactionsParams,
  PaginatedResponse,
} from "@/lib/types/api";

// ============================================================================
// Transaction Types
// ============================================================================

export interface CreateTransactionRequest {
  bookingId?: string;
  bookingRoomIds?: string[];
  serviceUsageId?: string;
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  description?: string;
  promotionApplications?: Array<{
    customerPromotionId: string;
    bookingRoomId?: string;
    serviceUsageId?: string;
  }>;
}

export interface TransactionResponse {
  transactionId: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: "COMPLETED" | "PENDING" | "FAILED";
  bookingStatus?: string;
  remainingBalance?: number;
}

export interface RefundRequest {
  bookingId: string;
  refundMethod?: "ORIGINAL_PAYMENT_METHOD" | PaymentMethod;
  notes?: string;
}

export interface RefundResponse {
  refundId: string;
  bookingId: string;
  amount: number;
  refundMethod: PaymentMethod;
  status: "COMPLETED" | "PENDING" | "FAILED";
  processedAt: string;
}

export interface BillResponse {
  bookingId: string;
  customerId: string;
  customerName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomCharges: number;
  serviceCharges: number;
  earlyCheckInFee: number;
  lateCheckOutFee: number;
  subtotal: number;
  discounts: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  breakdown: Array<{
    description: string;
    amount: number;
  }>;
}

// ============================================================================
// Transaction Service
// ============================================================================

export const transactionService = {
  /**
   * Create a transaction (deposit, payment, etc.)
   * POST /employee/transactions
   *
   * CRITICAL: The backend automatically calculates the amount based on:
   * - DEPOSIT: Minimum 30% of total booking amount
   * - ROOM_CHARGE: Total for specified rooms
   * - SERVICE_CHARGE: Total for specified services
   *
   * Frontend should NEVER send an amount field.
   */
  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<TransactionResponse> {
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
  },

  /**
   * Get all transactions with pagination and filters
   * GET /employee/transactions
   */
  async getTransactions(
    params?: GetTransactionsParams
  ): Promise<PaginatedResponse<Transaction>> {
    const queryParams = new URLSearchParams();
    if (params?.bookingId) queryParams.append("bookingId", params.bookingId);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const query = queryParams.toString();
    const url = `/employee/transactions${query ? `?${query}` : ""}`;

    const response = await api.get<PaginatedResponse<Transaction>>(url, {
      requiresAuth: true,
    });
    return response;
  },

  /**
   * Get transaction by ID
   * GET /employee/transactions/{transactionId}
   */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    const response = await api.get<ApiResponse<Transaction>>(
      `/employee/transactions/${transactionId}`,
      { requiresAuth: true }
    );
    const unwrappedData =
      response && typeof response === "object" && "data" in response
        ? (response as ApiResponse<Transaction>).data
        : (response as unknown as Transaction);
    return unwrappedData;
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
      console.error("Process refund failed:", error);
      throw error;
    }
  },
};
