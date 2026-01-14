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
   * Get transactions with pagination and filters
   * GET /employee/transactions
   */
  async getTransactions(
    filters?: GetTransactionsFilters,
    options?: GetTransactionsOptions
  ): Promise<TransactionListResponse> {
    try {
      const queryParams = { ...filters, ...options };
      const queryString = buildQueryString(
        queryParams as Record<string, unknown>
      );

      const response = await api.get<ApiResponse<TransactionListResponse>>(
        `/employee/transactions${queryString}`,
        { requiresAuth: true }
      );

      const data =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<TransactionListResponse>).data
          : (response as unknown as TransactionListResponse);
      return data;
    } catch (error) {
      console.error("Get transactions failed:", error);
      throw error;
    }
  },

  /**
   * Get transaction by ID with full details
   * GET /employee/transactions/{transactionId}
   */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    try {
      const response = await api.get<ApiResponse<Transaction>>(
        `/employee/transactions/${transactionId}`,
        { requiresAuth: true }
      );

      const data =
        response && typeof response === "object" && "data" in response
          ? (response as ApiResponse<Transaction>).data
          : (response as unknown as Transaction);
      return data;
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
