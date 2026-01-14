/**
 * Transaction Details Types
 * Source: roommaster-be/src/routes/v1/employee/transaction-details.route.ts
 */

import { Transaction } from "../services/folio-service";

export interface TransactionDetailsFilters {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "baseAmount" | "amount" | "discountAmount";
  sortOrder?: "asc" | "desc";
  transactionId?: string;
  bookingRoomId?: string;
  serviceUsageId?: string;
  minBaseAmount?: number;
  maxBaseAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  minDiscountAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
}

export interface TransactionDetailItem {
  id: string;
  transactionId: string;
  baseAmount: number;
  discountAmount: number;
  amount: number;
  transaction: Transaction;
  bookingRoom?: any; // Replace with proper type if available
  serviceUsage?: any; // Replace with proper type if available
  usedPromotions: any[]; // Replace with proper type if available
}

export interface TransactionDetailsResponse {
  details: TransactionDetailItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
