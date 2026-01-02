/**
 * Promotion Service
 * Handles all promotion-related API calls for both employee and customer
 * Matches backend roommaster-be API exactly
 */

import { api } from "./api";
import type {
  Promotion,
  CustomerPromotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  ClaimPromotionRequest,
  GetPromotionsParams,
} from "@/lib/types/promotion";
import type { PaginatedResponse } from "@/lib/types/api";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Serialize Decimal values to strings
 * Prisma Decimal types need to be converted to strings for frontend use
 */
function serializeDecimal(value: unknown): string {
  if (value === null || value === undefined) return "0";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  // Handle Decimal objects from Prisma
  if (typeof value === "object" && value !== null && "toString" in value) {
    return (value as unknown as { toString(): string }).toString();
  }
  return "0";
}

/**
 * Normalize promotion data from API response
 * Handles nested response structures and serializes Decimal values
 */
function normalizePromotionResponse(response: unknown) {
  const resp = response as Record<string, unknown>;
  
  // Extract promotions array from nested structure
  const promotionsData = 
    (resp?.data as Record<string, unknown>)?.data || 
    resp?.data || 
    [];

  const pagination = (resp?.data as Record<string, unknown>)?.pagination || resp?.pagination || {};

  // Serialize Decimal values in promotions
  const promotions = (Array.isArray(promotionsData) ? promotionsData : []).map(
    (promo: unknown) => {
      const p = promo as Record<string, unknown>;
      return {
        ...p,
        value: serializeDecimal(p.value),
        maxDiscount: p.maxDiscount ? serializeDecimal(p.maxDiscount) : null,
        minBookingAmount: serializeDecimal(p.minBookingAmount),
      } as Promotion;
    }
  );

  const pag = pagination as Record<string, unknown>;
  return {
    promotions: promotions as Promotion[],
    total: (pag.total as number) || 0,
    page: (pag.page as number) || 1,
    limit: (pag.limit as number) || 10,
  };
}

// ============================================================================
// Employee Promotion Management
// ============================================================================

/**
 * Create a new promotion (Employee only)
 * POST /employee/promotions
 */
export async function createPromotion(
  data: CreatePromotionRequest
): Promise<Promotion> {
  const response = await api.post<Record<string, unknown>>(
    "/employee/promotions",
    data,
    { requiresAuth: true }
  );

  // Normalize response to handle nested structure and serialize Decimals
  const resp = response as Record<string, unknown>;
  const promotionData = resp?.data || resp;
  
  return {
    ...(promotionData as Promotion),
    value: serializeDecimal((promotionData as Record<string, unknown>)?.value),
    maxDiscount: (promotionData as Record<string, unknown>)?.maxDiscount 
      ? serializeDecimal((promotionData as Record<string, unknown>)?.maxDiscount)
      : null,
    minBookingAmount: serializeDecimal((promotionData as Record<string, unknown>)?.minBookingAmount),
  } as Promotion;
}

/**
 * Get all promotions with filters (Employee)
 * GET /employee/promotions
 */
export async function getPromotions(
  params?: GetPromotionsParams
): Promise<PaginatedResponse<Promotion>> {
  const queryString = new URLSearchParams();
  if (params?.code) queryString.append("code", params.code);
  if (params?.description) queryString.append("description", params.description);
  if (params?.type) queryString.append("type", params.type);
  if (params?.scope) queryString.append("scope", params.scope);
  if (params?.page) queryString.append("page", params.page.toString());
  if (params?.limit) queryString.append("limit", params.limit.toString());
  if (params?.startDate) queryString.append("startDate", params.startDate);
  if (params?.endDate) queryString.append("endDate", params.endDate);

  const query = queryString.toString();
  const endpoint = `/employee/promotions${query ? `?${query}` : ""}`;

  const response = await api.get<Record<string, unknown>>(endpoint, {
    requiresAuth: true,
  });

  // Normalize response structure and serialize Decimal values
  const data = normalizePromotionResponse(response);
  
  return {
    data: data.promotions,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
}

/**
 * Update a promotion (Employee only)
 * PATCH /employee/promotions/:id
 */
export async function updatePromotion(
  id: string,
  data: UpdatePromotionRequest
): Promise<Promotion> {
  const response = await api.patch<Record<string, unknown>>(
    `/employee/promotions/${id}`,
    data,
    { requiresAuth: true }
  );
  
  // Normalize response to handle nested structure and serialize Decimals
  const resp = response as Record<string, unknown>;
  const promotionData = resp?.data || resp;
  
  return {
    ...(promotionData as Promotion),
    value: serializeDecimal((promotionData as Record<string, unknown>)?.value),
    maxDiscount: (promotionData as Record<string, unknown>)?.maxDiscount 
      ? serializeDecimal((promotionData as Record<string, unknown>)?.maxDiscount)
      : null,
    minBookingAmount: serializeDecimal((promotionData as Record<string, unknown>)?.minBookingAmount),
  } as Promotion;
}

/**
 * Soft delete promotion by setting disabledAt (Employee only)
 * PATCH /employee/promotions/:id
 */
export async function disablePromotion(id: string): Promise<Promotion> {
  const response = await api.patch<Record<string, unknown>>(
    `/employee/promotions/${id}`,
    { disabledAt: new Date().toISOString() },
    { requiresAuth: true }
  );

  // Normalize response to handle nested structure and serialize Decimals
  const resp = response as Record<string, unknown>;
  const promotionData = resp?.data || resp;
  
  return {
    ...(promotionData as Promotion),
    value: serializeDecimal((promotionData as Record<string, unknown>)?.value),
    maxDiscount: (promotionData as Record<string, unknown>)?.maxDiscount 
      ? serializeDecimal((promotionData as Record<string, unknown>)?.maxDiscount)
      : null,
    minBookingAmount: serializeDecimal((promotionData as Record<string, unknown>)?.minBookingAmount),
  } as Promotion;
}

/**
 * Re-enable a disabled promotion (Employee only)
 * PATCH /employee/promotions/:id
 */
export async function enablePromotion(id: string): Promise<Promotion> {
  const response = await api.patch<Record<string, unknown>>(
    `/employee/promotions/${id}`,
    { disabledAt: null },
    { requiresAuth: true }
  );

  // Normalize response to handle nested structure and serialize Decimals
  const resp = response as Record<string, unknown>;
  const promotionData = resp?.data || resp;
  
  return {
    ...(promotionData as Promotion),
    value: serializeDecimal((promotionData as Record<string, unknown>)?.value),
    maxDiscount: (promotionData as Record<string, unknown>)?.maxDiscount 
      ? serializeDecimal((promotionData as Record<string, unknown>)?.maxDiscount)
      : null,
    minBookingAmount: serializeDecimal((promotionData as Record<string, unknown>)?.minBookingAmount),
  } as Promotion;
}

// ============================================================================
// Customer Promotion Actions
// ============================================================================

/**
 * Get all available promotions for customer to claim
 * GET /customer/promotions/available
 */
export async function getAvailablePromotions(
  params?: GetPromotionsParams
): Promise<PaginatedResponse<Promotion>> {
  const queryString = new URLSearchParams();
  if (params?.code) queryString.append("code", params.code);
  if (params?.description) queryString.append("description", params.description);
  if (params?.type) queryString.append("type", params.type);
  if (params?.scope) queryString.append("scope", params.scope);
  if (params?.page) queryString.append("page", params.page.toString());
  if (params?.limit) queryString.append("limit", params.limit.toString());

  const query = queryString.toString();
  const endpoint = `/customer/promotions/available${query ? `?${query}` : ""}`;

  const response = await api.get<Record<string, unknown>>(endpoint, {
    requiresAuth: true,
  });

  // Normalize response structure and serialize Decimal values
  const data = normalizePromotionResponse(response);
  
  return {
    data: data.promotions,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
}

/**
 * Get customer's claimed promotions
 * GET /customer/promotions/my-promotions
 */
export async function getMyPromotions(
  params?: GetPromotionsParams
): Promise<PaginatedResponse<CustomerPromotion>> {
  const queryString = new URLSearchParams();
  if (params?.code) queryString.append("code", params.code);
  if (params?.description) queryString.append("description", params.description);
  if (params?.page) queryString.append("page", params.page.toString());
  if (params?.limit) queryString.append("limit", params.limit.toString());

  const query = queryString.toString();
  const endpoint = `/customer/promotions/my-promotions${query ? `?${query}` : ""}`;

  return api.get<PaginatedResponse<CustomerPromotion>>(endpoint, {
    requiresAuth: true,
  });
}

/**
 * Claim a promotion by code
 * POST /customer/promotions/claim
 */
export async function claimPromotion(
  data: ClaimPromotionRequest
): Promise<CustomerPromotion> {
  return api.post<CustomerPromotion>(
    "/customer/promotions/claim",
    data,
    { requiresAuth: true }
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate discount amount for a given base amount
 */
export function calculateDiscount(
  promotion: Promotion,
  baseAmount: number
): number {
  const value = parseFloat(promotion.value);

  if (promotion.type === "PERCENTAGE") {
    const discount = (baseAmount * value) / 100;
    const maxDiscount = promotion.maxDiscount
      ? parseFloat(promotion.maxDiscount)
      : Infinity;
    return Math.min(discount, maxDiscount);
  } else {
    // FIXED_AMOUNT
    return Math.min(value, baseAmount);
  }
}

/**
 * Calculate final amount after discount
 */
export function calculateFinalAmount(
  promotion: Promotion,
  baseAmount: number
): number {
  const discount = calculateDiscount(promotion, baseAmount);
  return Math.max(0, baseAmount - discount);
}

/**
 * Check if promotion is currently active
 */
export function isPromotionActive(promotion: Promotion): boolean {
  const now = new Date();
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);

  if (promotion.disabledAt) return false;
  if (now < startDate || now > endDate) return false;
  if (
    promotion.remainingQty !== null &&
    promotion.remainingQty !== undefined &&
    promotion.remainingQty <= 0
  )
    return false;

  return true;
}

/**
 * Get promotion status type (active | inactive | disabled)
 */
export function getPromotionStatusType(
  promotion: Promotion
): "active" | "inactive" | "disabled" {
  if (promotion.disabledAt) return "disabled";
  if (isPromotionActive(promotion)) return "active";
  return "inactive";
}

/**
 * Format promotion value for display
 */
export function formatPromotionValue(promotion: Promotion): string {
  if (!promotion.value) {
    return promotion.type === "PERCENTAGE" ? "0%" : "0 ₫";
  }

  const value = parseFloat(String(promotion.value));

  if (isNaN(value)) {
    return promotion.type === "PERCENTAGE" ? "Invalid %" : "Invalid ₫";
  }

  if (promotion.type === "PERCENTAGE") {
    return `${value}%`;
  } else {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  }
}

/**
 * Get promotion status color
 */
export function getPromotionStatusColor(
  promotion: Promotion
): "default" | "success" | "warning" | "destructive" {
  if (promotion.disabledAt) return "destructive";
  if (!isPromotionActive(promotion)) return "default";

  const remainingPercent =
    promotion.totalQty && promotion.remainingQty
      ? (promotion.remainingQty / promotion.totalQty) * 100
      : 100;

  if (remainingPercent <= 10) return "destructive";
  if (remainingPercent <= 30) return "warning";
  return "success";
}

/**
 * Get customer promotion status color
 */
export function getCustomerPromotionStatusColor(
  status: CustomerPromotion["status"]
): "default" | "success" | "warning" | "destructive" {
  switch (status) {
    case "AVAILABLE":
      return "success";
    case "USED":
      return "default";
    case "EXPIRED":
      return "destructive";
    default:
      return "default";
  }
}

export const promotionService = {
  // Employee
  createPromotion,
  getPromotions,
  updatePromotion,
  disablePromotion,
  enablePromotion,

  // Customer
  getAvailablePromotions,
  getMyPromotions,
  claimPromotion,

  // Helpers
  calculateDiscount,
  calculateFinalAmount,
  isPromotionActive,
  getPromotionStatusType,
  formatPromotionValue,
  getPromotionStatusColor,
  getCustomerPromotionStatusColor,
};
