// ==============================
// DYNAMIC PRICING (NEW - Backend Aligned)
// ==============================

/**
 * Pricing Rule model - Matches Backend PricingRule schema exactly
 * Source: roommaster-be/prisma/schema.prisma (PricingRule model)
 */
export interface PricingRule {
  id: string;
  name: string; // Rule name e.g., "Giảm giá cuối tuần"
  rank: string; // LexoRank string for drag-drop ordering
  roomTypeIds: string[]; // Empty array = applies to ALL room types
  
  // Time matching (ONLY ONE method should be used)
  calendarEventId: string | null; // Link to CalendarEvent (preferred)
  startDate: string | null; // ISO date string (alternative to calendarEvent)
  endDate: string | null; // ISO date string (alternative to calendarEvent)
  recurrenceRule: string | null; // RRule pattern (RFC 5545) e.g., "FREQ=WEEKLY;BYDAY=SA,SU"
  
  // Adjustment
  adjustmentType: AdjustmentType; // "PERCENTAGE" | "FIXED_AMOUNT"
  adjustmentValue: string; // Decimal string (can be negative for discounts)
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  
  // Relations (optional - populated when needed)
  calendarEvent?: CalendarEvent;
}

/**
 * Adjustment type enum
 */
export enum AdjustmentType {
  PERCENTAGE = "PERCENTAGE", // e.g., 20% increase
  FIXED_AMOUNT = "FIXED_AMOUNT", // e.g., +50,000 VND
}

/**
 * Event type enum - Matches Backend EventType
 */
export enum EventType {
  HOLIDAY = "HOLIDAY", // Lễ, Tết (Thường priority cao)
  SEASONAL = "SEASONAL", // Mùa vụ (Hè, Mưa)
  SPECIAL_EVENT = "SPECIAL_EVENT", // Sự kiện (Blackpink, Pháo hoa)
}

/**
 * Calendar Event for pricing rules
 * Matches Backend CalendarEvent model exactly
 */
export interface CalendarEvent {
  id: string;
  name: string; // "Tết Nguyên Đán 2026", "Mùa Hè 2026"
  description: string | null;
  type: EventType; // HOLIDAY | SEASONAL | SPECIAL_EVENT
  startDate: string; // ISO datetime string
  endDate: string; // ISO datetime string
  rrule: string | null; // RFC 5545 recurring pattern (e.g., "FREQ=YEARLY;BYMONTH=4;BYMONTHDAY=30")
  pricingRules?: PricingRule[]; // Optional relation
  createdAt: string;
  updatedAt: string;
}

/**
 * Request body for creating a calendar event
 */
export interface CreateCalendarEventRequest {
  name: string;
  description?: string | null;
  type: EventType;
  startDate: string; // ISO datetime or YYYY-MM-DD
  endDate: string; // ISO datetime or YYYY-MM-DD
  rrule?: string | null; // RFC 5545 recurring pattern
}

/**
 * Request body for updating a calendar event
 */
export interface UpdateCalendarEventRequest {
  name?: string;
  description?: string | null;
  type?: EventType;
  startDate?: string;
  endDate?: string;
  rrule?: string | null;
}

/**
 * Request body for creating a pricing rule
 */
export interface CreatePricingRuleRequest {
  name: string;
  roomTypeIds: string[]; // Empty = all room types
  calendarEventId?: string | null;
  startDate?: string | null; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD
  recurrenceRule?: string | null; // RRule pattern
  adjustmentType: AdjustmentType;
  adjustmentValue: number; // Will be converted to Decimal
  isActive?: boolean; // Defaults to true
}

/**
 * Request body for updating a pricing rule
 */
export interface UpdatePricingRuleRequest {
  name?: string;
  roomTypeIds?: string[];
  calendarEventId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  recurrenceRule?: string | null;
  adjustmentType?: AdjustmentType;
  adjustmentValue?: number;
  isActive?: boolean;
}

/**
 * Request body for reordering pricing rules (drag-drop)
 */
export interface ReorderPricingRuleRequest {
  prevRank: string | null; // LexoRank of previous rule (null if moving to top)
  nextRank: string | null; // LexoRank of next rule (null if moving to bottom)
}

/**
 * Response from price calculation API
 */
export interface PriceCalculationResult {
  basePrice: number;
  finalPrice: number;
  appliedRule: PricingRule | null;
}

/**
 * Form data for pricing rule modal
 */
export interface PricingRuleFormData {
  name: string;
  roomTypeIds: string[];
  timeMatchingMethod: "calendar" | "dateRange" | "recurrence"; // UI helper
  calendarEventId?: string;
  startDate?: string;
  endDate?: string;
  recurrencePattern?: string; // UI-friendly pattern (converted to RRule)
  customRRule?: string; // Raw RRule string
  adjustmentType: AdjustmentType;
  adjustmentValue: number;
  isActive: boolean;
}

/**
 * Common RRule patterns for UI
 */
export interface RRulePattern {
  label: string;
  description: string;
  rrule: string;
  category: "weekend" | "weekday" | "monthly" | "holiday" | "custom";
}

// ==============================
// OLD PRICING ENGINE (Deprecated - For Backward Compatibility)
// ==============================

/**
 * @deprecated Use PricingRule instead
 */
export interface PricingPolicy {
  MaChinhSach: string;
  TenChinhSach: string;
  MaLoaiPhong: string;
  TenLoaiPhong?: string;
  TuNgay: string;
  DenNgay: string;
  KieuNgay: "Ngày thường" | "Cuối tuần" | "Ngày lễ" | "Tất cả";
  HeSo: number;
  MucUuTien: number;
}

/**
 * @deprecated Use CreatePricingRuleRequest instead
 */
export interface PricingPolicyFormData {
  TenChinhSach: string;
  MaLoaiPhong: string;
  TuNgay: string;
  DenNgay: string;
  KieuNgay: "Ngày thường" | "Cuối tuần" | "Ngày lễ" | "Tất cả";
  HeSo: number;
  MucUuTien: number;
}

/**
 * @deprecated Special pricing for specific dates - not used in new system
 */
export interface SpecialPriceDate {
  dateID: string;
  date: string; // YYYY-MM-DD format
  roomTypeID: string;
  roomTypeName: string;
  specialPrice: number;
  reason: string; // e.g., "Tết Holiday", "Christmas"
  isActive: boolean;
}
