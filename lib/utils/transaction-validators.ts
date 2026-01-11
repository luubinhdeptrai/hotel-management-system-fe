/**
 * Transaction Validators
 * Business logic validation for transaction and service usage operations
 */

import type { TransactionDetail } from "@/lib/types/folio";
import type { ServiceUsageRequest } from "@/lib/types/checkin-checkout";
import type { CreateTransactionRequest } from "@/lib/services/transaction.service";

/**
 * Validates that exactly one of bookingRoomId or serviceUsageId is set
 * Backend business rule: TransactionDetail must have either room OR service, not both
 */
export const validateTransactionDetailInput = (
  input: Partial<TransactionDetail>
): { valid: boolean; error?: string } => {
  const hasRoom = Boolean(input.bookingRoomId);
  const hasService = Boolean(input.serviceUsageId);

  if (!hasRoom && !hasService) {
    return {
      valid: false,
      error: "TransactionDetail must have either bookingRoomId or serviceUsageId",
    };
  }

  if (hasRoom && hasService) {
    return {
      valid: false,
      error: "TransactionDetail cannot have both bookingRoomId and serviceUsageId",
    };
  }

  return { valid: true };
};

/**
 * Validates ServiceUsageRequest has required fields
 */
export const validateServiceUsageRequest = (
  input: Partial<ServiceUsageRequest>
): { valid: boolean; error?: string } => {
  if (!input.serviceId) {
    return { valid: false, error: "serviceId is required" };
  }

  if (!input.quantity || input.quantity <= 0) {
    return { valid: false, error: "quantity must be greater than 0" };
  }

  // For booking services, at least one of bookingId or bookingRoomId should be set
  const hasBookingContext = Boolean(input.bookingId || input.bookingRoomId);
  
  return { valid: true };
};

/**
 * Validates CreateTransactionRequest based on payment scenario
 */
export const validateTransactionRequest = (
  input: Partial<CreateTransactionRequest>
): { valid: boolean; error?: string } => {
  // Common validations
  if (!input.paymentMethod) {
    return { valid: false, error: "paymentMethod is required" };
  }

  if (!input.transactionType) {
    return { valid: false, error: "transactionType is required" };
  }

  // Scenario-based validations
  const hasBookingId = Boolean(input.bookingId);
  const hasBookingRoomIds = Boolean(input.bookingRoomIds && input.bookingRoomIds.length > 0);
  const hasServiceUsageId = Boolean(input.serviceUsageId);

  // Scenario 1: Full booking payment - bookingId only
  // Scenario 2: Split room payment - bookingId + bookingRoomIds
  // Scenario 3: Booking service payment - bookingId + serviceUsageId
  // Scenario 4: Guest service payment - serviceUsageId only (no bookingId)

  if (hasServiceUsageId) {
    // Scenarios 3 or 4
    if (!hasBookingId) {
      // Scenario 4: Guest service payment
      // Valid - no additional checks needed
    } else {
      // Scenario 3: Booking service payment
      // Valid - both bookingId and serviceUsageId present
    }
  } else if (hasBookingRoomIds) {
    // Scenario 2: Split room payment
    if (!hasBookingId) {
      return {
        valid: false,
        error: "bookingId is required for split room payment",
      };
    }
  } else if (hasBookingId) {
    // Scenario 1: Full booking payment
    // Valid - just bookingId
  } else {
    return {
      valid: false,
      error: "Must provide either bookingId, bookingRoomIds, or serviceUsageId",
    };
  }

  return { valid: true };
};

/**
 * Validates promotion application structure
 */
export const validatePromotionApplication = (
  input: {
    customerPromotionId: string;
    bookingRoomId?: string;
    serviceUsageId?: string;
  }
): { valid: boolean; error?: string } => {
  if (!input.customerPromotionId) {
    return { valid: false, error: "customerPromotionId is required" };
  }

  // At most one of bookingRoomId or serviceUsageId should be set
  const hasRoom = Boolean(input.bookingRoomId);
  const hasService = Boolean(input.serviceUsageId);

  if (hasRoom && hasService) {
    return {
      valid: false,
      error: "Promotion cannot be applied to both room and service simultaneously",
    };
  }

  return { valid: true };
};

/**
 * Validates payment amount against balance
 */
export const validatePaymentAmount = (
  amount: number,
  balance: number
): { valid: boolean; error?: string } => {
  if (amount <= 0) {
    return { valid: false, error: "Payment amount must be greater than 0" };
  }

  if (amount > balance) {
    return {
      valid: false,
      error: `Payment amount (${amount}) exceeds balance (${balance})`,
    };
  }

  return { valid: true };
};

/**
 * Helper to check if service usage is fully paid
 */
export const isServiceFullyPaid = (
  totalPrice: number,
  totalPaid: number
): boolean => {
  return totalPaid >= totalPrice;
};

/**
 * Helper to calculate service balance
 */
export const calculateServiceBalance = (
  totalPrice: number,
  totalPaid: number
): number => {
  return Math.max(0, totalPrice - totalPaid);
};

/**
 * Helper to parse price from backend Decimal string to number
 */
export const parseDecimalPrice = (price: string | number): number => {
  if (typeof price === "number") return price;
  return parseFloat(price) || 0;
};

/**
 * Helper to format price for API submission
 */
export const formatPriceForAPI = (price: number): number => {
  // Backend expects number, will convert to Decimal(10,2)
  return Math.round(price * 100) / 100; // Round to 2 decimal places
};
