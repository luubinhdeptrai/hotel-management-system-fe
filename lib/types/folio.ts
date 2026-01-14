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

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "E_WALLET";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Tiền mặt",
  CREDIT_CARD: "Thẻ tín dụng",
  BANK_TRANSFER: "Chuyển khoản",
  E_WALLET: "Ví điện tử",
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
  // Schema fields
  id: string; // was transactionID
  bookingId: string | null; // was folioID?
  type: TransactionType;
  baseAmount: number;
  discountAmount: number;
  amount: number;
  method?: PaymentMethod | null;
  status: TransactionStatus;

  processedById: string | null;
  occurredAt: string;
  createdAt: string;

  // Relations
  details?: TransactionDetail[];

  // Legacy / UI
  transactionID?: string;
  folioID?: string;
  date?: string; // Derived from occurredAt
  time?: string; // Derived from occurredAt
  description: string; // Matches Schema
  createdBy?: string; // from processedBy
  isVoided?: boolean;
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

// Payment method labels (Moved up)
// export const PAYMENT_METHOD_LABELS: Record<string, string> = {
//   CASH: "Tiền mặt",
//   CARD: "Thẻ tín dụng/ghi nợ",
//   TRANSFER: "Chuyển khoản",
// };
