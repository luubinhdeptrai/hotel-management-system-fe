/**
 * Transaction Service
 * Handles all transaction-related API calls (deposits, payments, refunds)
 */

import { api } from "./api";
import type {
  ApiResponse,
  PaymentMethod,
  TransactionType,
} from "@/lib/types/api";

// ============================================================================
// Transaction Types
// ============================================================================

export interface CreateTransactionRequest {
  bookingId?: string; // Optional for guest service payments
  bookingRoomIds?: string[];
  serviceUsageId?: string; // For service payment scenarios
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  description?: string; // Transaction notes
  promotionApplications?: Array<{
    customerPromotionId: string;
    bookingRoomId?: string; // For room-specific promotions
    serviceUsageId?: string; // For service-specific promotions
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
   * - FINAL_PAYMENT: Remaining balance after deposits
   *
   * Frontend should NEVER send an amount field.
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
   * Get final bill for a booking
   * GET /employee/bookings/{bookingId}/bill
   */
  async getBill(bookingId: string): Promise<BillResponse> {
    try {
      const response = await api.get<ApiResponse<BillResponse>>(
        `/employee/bookings/${bookingId}/bill`,
        { requiresAuth: true }
      );
      const data =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<BillResponse>).data
          : (response as unknown as BillResponse);
      return data;
    } catch (error) {
      console.error("Get bill failed:", error);
      throw error;
    }
  },

  /**
   * Process refund for cancelled booking
   * POST /employee/transactions/refund
   *
   * CRITICAL: The backend automatically calculates refund amount based on:
   * - Cancellation policy (48+ hours: 100%, 24-48 hours: 50%, <24 hours: 0%)
   * - Total deposits paid
   *
   * Frontend should NEVER send an amount field.
   */
  async processRefund(data: RefundRequest): Promise<RefundResponse> {
    try {
      const response = await api.post<ApiResponse<RefundResponse>>(
        "/employee/transactions/refund",
        data,
        { requiresAuth: true }
      );
      const unwrappedData =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<RefundResponse>).data
          : (response as unknown as RefundResponse);
      return unwrappedData;
    } catch (error) {
      console.error("Process refund failed:", error);
      throw error;
    }
  },
};
