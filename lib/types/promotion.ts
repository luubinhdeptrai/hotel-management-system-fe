/**
 * Promotion Types
 * Matches backend roommaster-be Prisma schema exactly
 */

// ============================================================================
// Enums - Must match backend exactly
// ============================================================================

export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT";

export type PromotionScope = "ROOM" | "SERVICE" | "ALL";

export type CustomerPromotionStatus = "AVAILABLE" | "USED" | "EXPIRED";

// ============================================================================
// Promotion Entity
// ============================================================================

export interface Promotion {
  id: string;
  code: string;
  description: string | null;
  type: PromotionType;
  scope: PromotionScope;
  value: string; // Decimal from backend comes as string
  maxDiscount: string | null;
  minBookingAmount: string;
  startDate: string; // ISO date string
  endDate: string;
  totalQty: number | null; // null = unlimited
  remainingQty: number | null;
  perCustomerLimit: number;
  disabledAt: string | null; // null = active
  createdAt: string;
  updatedAt: string;
  _count?: {
    customerPromotions: number;
    usedPromotions: number;
  };
}

// ============================================================================
// Customer Promotion (Claimed Promotion)
// ============================================================================

export interface CustomerPromotion {
  id: string;
  customerId: string;
  promotionId: string;
  status: CustomerPromotionStatus;
  claimedAt: string;
  usedAt: string | null;
  customer?: {
    id: string;
    fullName: string;
    phone: string;
  };
  promotion?: Promotion;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API Request Types
// ============================================================================

export interface CreatePromotionRequest {
  code: string;
  description?: string;
  type: PromotionType;
  scope?: PromotionScope; // default: ALL
  value: number;
  maxDiscount?: number;
  minBookingAmount?: number; // default: 0
  startDate: string; // ISO date
  endDate: string;
  totalQty?: number; // null = unlimited
  perCustomerLimit?: number; // default: 1
}

export interface UpdatePromotionRequest {
  code?: string;
  description?: string;
  value?: number;
  maxDiscount?: number;
  minBookingAmount?: number;
  startDate?: string;
  endDate?: string;
  totalQty?: number;
  remainingQty?: number;
  perCustomerLimit?: number;
  disabledAt?: string | null; // set null to re-enable
}

export interface ClaimPromotionRequest {
  promotionCode: string;
}

// ============================================================================
// API Query Parameters
// ============================================================================

export interface GetPromotionsParams {
  page?: number;
  limit?: number;
  code?: string;
  description?: string;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determine if promotion is currently active
 */
export function isPromotionActive(promotion: Promotion): boolean {
  const now = new Date();
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);
  
  // Check if disabled
  if (promotion.disabledAt) {
    const disabledAt = new Date(promotion.disabledAt);
    if (disabledAt <= now) return false;
  }
  
  // Check date range
  if (now < startDate || now > endDate) return false;
  
  // Check remaining quantity
  if (promotion.remainingQty !== null && promotion.remainingQty <= 0) return false;
  
  return true;
}

/**
 * Get promotion status label
 */
export function getPromotionStatus(promotion: Promotion): {
  status: "active" | "scheduled" | "expired" | "disabled" | "exhausted";
  label: string;
  color: string;
} {
  const now = new Date();
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);
  
  // Check disabled first
  if (promotion.disabledAt) {
    const disabledAt = new Date(promotion.disabledAt);
    if (disabledAt <= now) {
      return { status: "disabled", label: "Đã vô hiệu", color: "gray" };
    }
  }
  
  // Check if exhausted (quantity ran out)
  if (promotion.remainingQty !== null && promotion.remainingQty <= 0) {
    return { status: "exhausted", label: "Đã hết", color: "orange" };
  }
  
  // Check date range
  if (now < startDate) {
    return { status: "scheduled", label: "Chưa bắt đầu", color: "blue" };
  }
  
  if (now > endDate) {
    return { status: "expired", label: "Đã hết hạn", color: "red" };
  }
  
  return { status: "active", label: "Đang hoạt động", color: "green" };
}

/**
 * Format promotion value for display
 */
export function formatPromotionValue(promotion: Promotion): string {
  const value = parseFloat(promotion.value);
  
  if (promotion.type === "PERCENTAGE") {
    return `${value}%`;
  }
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

/**
 * Get scope label in Vietnamese
 */
export function getScopeLabel(scope: PromotionScope): string {
  switch (scope) {
    case "ROOM":
      return "Tiền phòng";
    case "SERVICE":
      return "Dịch vụ";
    case "ALL":
      return "Tất cả";
    default:
      return scope;
  }
}

/**
 * Get type label in Vietnamese
 */
export function getTypeLabel(type: PromotionType): string {
  switch (type) {
    case "PERCENTAGE":
      return "Phần trăm";
    case "FIXED_AMOUNT":
      return "Số tiền cố định";
    default:
      return type;
  }
}
