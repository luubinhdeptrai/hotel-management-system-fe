/**
 * Transaction Details Service
 * Handles transaction details search and filtering
 * Backend: roommaster-be/src/routes/v1/employee/transaction-details.route.ts
 */

import { api } from "./api";
import type {
  TransactionDetailsFilters,
  TransactionDetailsResponse,
} from "@/lib/types/transaction-details";

const BASE_PATH = "/employee/transaction-details";

export const transactionDetailsService = {
  /**
   * Search transaction details
   * GET /employee/transaction-details
   */
  async getTransactionDetails(
    filters: TransactionDetailsFilters = {}
  ): Promise<TransactionDetailsResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    if (filters.transactionId)
      params.append("transactionId", filters.transactionId);
    if (filters.bookingRoomId)
      params.append("bookingRoomId", filters.bookingRoomId);
    if (filters.serviceUsageId)
      params.append("serviceUsageId", filters.serviceUsageId);

    if (filters.minBaseAmount !== undefined)
      params.append("minBaseAmount", String(filters.minBaseAmount));
    if (filters.maxBaseAmount !== undefined)
      params.append("maxBaseAmount", String(filters.maxBaseAmount));
    if (filters.minAmount !== undefined)
      params.append("minAmount", String(filters.minAmount));
    if (filters.maxAmount !== undefined)
      params.append("maxAmount", String(filters.maxAmount));
    if (filters.minDiscountAmount !== undefined)
      params.append("minDiscountAmount", String(filters.minDiscountAmount));
    if (filters.maxDiscountAmount !== undefined)
      params.append("maxDiscountAmount", String(filters.maxDiscountAmount));

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const queryString = params.toString();
    const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;

    const response = await api.get<TransactionDetailsResponse>(url, {
      requiresAuth: true,
    });

    return response;
  },
};
