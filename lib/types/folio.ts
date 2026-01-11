// Folio and Transaction Types

// Transaction types for folio - MUST match backend exactly
export type TransactionType =
  | "DEPOSIT" // Advance payment
  | "ROOM_CHARGE" // Room-specific charges
  | "SERVICE_CHARGE" // Service-specific charges
  | "REFUND" // Money returned to guest
  | "ADJUSTMENT"; // Manual correction

// Transaction type labels
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  DEPOSIT: "Đặt cọc",
  ROOM_CHARGE: "Tiền phòng",
  SERVICE_CHARGE: "Tiền dịch vụ",
  REFUND: "Hoàn tiền",
  ADJUSTMENT: "Điều chỉnh",
};

// Transaction type colors for badges
export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  DEPOSIT: "bg-indigo-100 text-indigo-800",
  ROOM_CHARGE: "bg-blue-100 text-blue-800",
  SERVICE_CHARGE: "bg-green-100 text-green-800",
  REFUND: "bg-pink-100 text-pink-800",
  ADJUSTMENT: "bg-gray-100 text-gray-800",
};

// Transaction Detail (individual charge allocation)
export interface TransactionDetail {
  id: string;
  transactionId: string | null; // Nullable for guest service payments
  bookingRoomId: string | null;
  serviceUsageId: string | null;
  baseAmount: number;
  discountAmount: number;
  amount: number;
  roomNumber?: string; // For display
  serviceName?: string; // For display
}

// Individual transaction
export interface FolioTransaction {
  transactionID: string;
  folioID: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  type: TransactionType;
  description: string;
  baseAmount: number; // Amount before discounts
  discountAmount: number; // Total discounts applied
  amount: number; // Final amount (baseAmount - discountAmount)
  method?: string; // Payment method (CASH, CREDIT_CARD, etc.)
  status: string; // Transaction status
  createdBy: string; // Employee name
  createdAt: string; // Full timestamp
  isVoided?: boolean; // True if transaction was cancelled
  voidedBy?: string;
  voidedAt?: string;
  details?: TransactionDetail[]; // Breakdown by room/service
}

// Folio status
export type FolioStatus = "OPEN" | "CLOSED";

// Main folio (guest account)
export interface Folio {
  folioID: string;
  reservationID?: string;
  customerID: string;
  customerName: string;
  roomID: string;
  roomName: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate?: string;
  status: FolioStatus;
  transactions: FolioTransaction[];
  totalDebit: number; // Sum of all debits
  totalCredit: number; // Sum of all credits
  balance: number; // totalDebit - totalCredit
  createdAt: string;
  closedAt?: string;
  closedBy?: string;
}

// Form data for posting charges
export interface PostChargeFormData {
  type: TransactionType;
  description: string;
  amount: number;
  date?: string;
}

// Form data for posting payments
export interface PostPaymentFormData {
  amount: number;
  paymentMethod: "CASH" | "CARD" | "TRANSFER";
  reference?: string; // Card/transfer reference number
  notes?: string;
  mode?: "PAYMENT" | "DEPOSIT"; // Payment mode
}

// Payment method labels
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Tiền mặt",
  CARD: "Thẻ tín dụng/ghi nợ",
  TRANSFER: "Chuyển khoản",
};
