/**
 * Pricing Rule Service
 * 
 * API service for managing dynamic pricing rules
 * Backend: roommaster-be/src/routes/v1/employee/pricing-rule.route.ts
 */

import type {
  PricingRule,
  CreatePricingRuleRequest,
  UpdatePricingRuleRequest,
  ReorderPricingRuleRequest,
  CalendarEvent,
  PriceCalculationResult,
} from "@/lib/types/pricing";
import { getAccessToken } from "./api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";
const API_PREFIX = "/employee/pricing-rules";

/**
 * Get authorization headers
 */
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || "API request failed");
  }
  return response.json();
}

// ==============================
// Pricing Rules API
// ==============================

/**
 * Get all pricing rules (sorted by rank ASC)
 * 
 * @param includeInactive - Include inactive rules (default: false)
 * @returns Array of pricing rules
 */
export async function getPricingRules(
  includeInactive = false
): Promise<PricingRule[]> {
  const url = new URL(`${API_BASE_URL}${API_PREFIX}`);
  url.searchParams.set("includeInactive", String(includeInactive));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<PricingRule[]>(response);
}

/**
 * Get a single pricing rule by ID
 * 
 * @param id - Rule ID
 * @returns Pricing rule with calendar event relation
 */
export async function getPricingRuleById(id: string): Promise<PricingRule> {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<PricingRule>(response);
}

/**
 * Create a new pricing rule
 * 
 * @param data - Pricing rule data
 * @returns Created pricing rule
 */
export async function createPricingRule(
  data: CreatePricingRuleRequest
): Promise<PricingRule> {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<PricingRule>(response);
}

/**
 * Update an existing pricing rule
 * 
 * @param id - Rule ID
 * @param data - Updated pricing rule data
 * @returns Updated pricing rule
 */
export async function updatePricingRule(
  id: string,
  data: UpdatePricingRuleRequest
): Promise<PricingRule> {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<PricingRule>(response);
}

/**
 * Delete a pricing rule (soft delete - sets isActive to false)
 * 
 * @param id - Rule ID
 * @returns Success message
 */
export async function deletePricingRule(
  id: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse<{ message: string }>(response);
}

/**
 * Reorder pricing rule (drag-drop)
 * Updates the LexoRank based on position between prevRank and nextRank
 * 
 * @param id - Rule ID to reorder
 * @param prevRank - LexoRank of previous rule (null if moving to top)
 * @param nextRank - LexoRank of next rule (null if moving to bottom)
 * @returns Updated pricing rule with new rank
 */
export async function reorderPricingRule(
  id: string,
  data: ReorderPricingRuleRequest
): Promise<PricingRule> {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}/${id}/reorder`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<PricingRule>(response);
}

// ==============================
// Calendar Events API (for pricing rule time matching)
// ==============================

/**
 * Get all calendar events
 * Used for linking pricing rules to calendar events
 * 
 * @returns Array of calendar events
 */
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const response = await fetch(
    `${API_BASE_URL}/employee/calendar-events`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse<CalendarEvent[]>(response);
}

// ==============================
// Price Calculation (Preview)
// ==============================

/**
 * Calculate dynamic price for a room type on a specific date
 * Returns base price, final price, and applied rule
 * 
 * @param roomTypeId - Room type ID (use "all" for all room types)
 * @param date - Date to calculate price for (YYYY-MM-DD)
 * @returns Price calculation result
 */
export async function calculatePrice(
  roomTypeId: string,
  date: string
): Promise<PriceCalculationResult> {
  const url = new URL(`${API_BASE_URL}/employee/pricing-calculator`);
  url.searchParams.set("roomTypeId", roomTypeId);
  url.searchParams.set("date", date);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<PriceCalculationResult>(response);
}

// ==============================
// Utility Functions
// ==============================

/**
 * Validate RRule pattern (basic validation)
 * Full validation should be done on backend
 * 
 * @param rrule - RRule string (RFC 5545)
 * @returns True if pattern looks valid
 */
export function isValidRRule(rrule: string): boolean {
  // Basic validation - must start with FREQ=
  return /^FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/i.test(rrule);
}

/**
 * Format adjustment value for display
 * 
 * @param value - Adjustment value
 * @param type - Adjustment type
 * @returns Formatted string
 */
export function formatAdjustment(
  value: number | string,
  type: "PERCENTAGE" | "FIXED_AMOUNT"
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (type === "PERCENTAGE") {
    const sign = numValue >= 0 ? "+" : "";
    return `${sign}${numValue}%`;
  } else {
    const sign = numValue >= 0 ? "+" : "";
    return `${sign}${numValue.toLocaleString("vi-VN")} VND`;
  }
}

/**
 * Get description of time matching method
 * 
 * @param rule - Pricing rule
 * @returns Human-readable description
 */
export function getTimeMatchingDescription(rule: PricingRule): string {
  if (rule.calendarEventId && rule.calendarEvent) {
    return `Sự kiện: ${rule.calendarEvent.name}`;
  }
  
  if (rule.startDate && rule.endDate) {
    return `${rule.startDate} đến ${rule.endDate}`;
  }
  
  if (rule.recurrenceRule) {
    // Parse RRule for human-readable format (basic)
    if (rule.recurrenceRule.includes("BYDAY=SA,SU")) {
      return "Cuối tuần (Thứ 7, Chủ nhật)";
    }
    if (rule.recurrenceRule.includes("BYDAY=MO,TU,WE,TH,FR")) {
      return "Ngày thường (Thứ 2 - Thứ 6)";
    }
    return `Lặp lại: ${rule.recurrenceRule}`;
  }
  
  return "Áp dụng mọi lúc";
}

/**
 * Check if two pricing rules conflict (same room types and overlapping time)
 * 
 * @param rule1 - First pricing rule
 * @param rule2 - Second pricing rule
 * @returns True if rules conflict
 */
export function checkRuleConflict(
  rule1: PricingRule,
  rule2: PricingRule
): boolean {
  // Check room type overlap
  const hasRoomOverlap =
    rule1.roomTypeIds.length === 0 ||
    rule2.roomTypeIds.length === 0 ||
    rule1.roomTypeIds.some((id) => rule2.roomTypeIds.includes(id));

  if (!hasRoomOverlap) return false;

  // Check time overlap (simplified - full check requires RRule parsing)
  // TODO: Implement full time overlap check with RRule support
  
  return false; // For now, return false (conflict checking done on backend)
}
