// Payment-related types
import type { CheckoutSummary } from "@/lib/types/checkin-checkout";

export type PaymentMethod = "Tiền mặt" | "Thẻ tín dụng" | "Chuyển khoản";

// Summary used by payments listing (aliasing existing checkout summary structure)
export type InvoiceSummary = CheckoutSummary;
