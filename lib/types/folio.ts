// Folio and Transaction Types

// Transaction types for folio
export type TransactionType =
  | "ROOM_CHARGE" // Daily room rate
  | "SERVICE" // Minibar, laundry, F&B
  | "PAYMENT" // Cash, card, bank transfer
  | "SURCHARGE" // Early checkin, late checkout, extra guest
  | "PENALTY" // Damage, loss
  | "DEPOSIT" // Advance payment
  | "REFUND" // Money returned to guest
  | "ADJUSTMENT"; // Manual correction

// Transaction type labels
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  ROOM_CHARGE: "Tiền phòng",
  SERVICE: "Dịch vụ",
  PAYMENT: "Thanh toán",
  SURCHARGE: "Phụ thu",
  PENALTY: "Phí phạt",
  DEPOSIT: "Đặt cọc",
  REFUND: "Hoàn tiền",
  ADJUSTMENT: "Điều chỉnh",
};

// Transaction type colors for badges
export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  ROOM_CHARGE: "bg-blue-100 text-blue-800",
  SERVICE: "bg-green-100 text-green-800",
  PAYMENT: "bg-purple-100 text-purple-800",
  SURCHARGE: "bg-amber-100 text-amber-800",
  PENALTY: "bg-red-100 text-red-800",
  DEPOSIT: "bg-indigo-100 text-indigo-800",
  REFUND: "bg-pink-100 text-pink-800",
  ADJUSTMENT: "bg-gray-100 text-gray-800",
};

// Individual transaction
export interface FolioTransaction {
  transactionID: string;
  folioID: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  type: TransactionType;
  description: string;
  debit: number; // Charges (money customer owes)
  credit: number; // Payments (money customer paid)
  createdBy: string; // Employee name
  createdAt: string; // Full timestamp
  isVoided?: boolean; // True if transaction was cancelled
  voidedBy?: string;
  voidedAt?: string;
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
