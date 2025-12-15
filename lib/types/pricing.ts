// Pricing Engine Types - Based on CHINHSACH_GIA database table

// CHINHSACH_GIA (MaChinhSach, TenChinhSach, MaLoaiPhong, TuNgay, DenNgay, KieuNgay, HeSo, MucUuTien)
export interface PricingPolicy {
  MaChinhSach: string; // Policy ID
  TenChinhSach: string; // Policy Name
  MaLoaiPhong: string; // Room Type ID
  TenLoaiPhong?: string; // Room Type Name (joined from room type table)
  TuNgay: string; // From Date (YYYY-MM-DD)
  DenNgay: string; // To Date (YYYY-MM-DD)
  KieuNgay: "Ngày thường" | "Cuối tuần" | "Ngày lễ" | "Tất cả"; // Date Type
  HeSo: number; // Multiplier Factor (e.g., 1.0, 1.2, 1.5)
  MucUuTien: number; // Priority Level (higher = more priority)
}

// Form data for creating/editing pricing policies
export interface PricingPolicyFormData {
  TenChinhSach: string;
  MaLoaiPhong: string;
  TuNgay: string;
  DenNgay: string;
  KieuNgay: "Ngày thường" | "Cuối tuần" | "Ngày lễ" | "Tất cả";
  HeSo: number;
  MucUuTien: number;
}

// OLD TYPES - Keeping for backward compatibility
// Pricing Rule for dynamic rates
export interface PricingRule {
  ruleID: string;
  roomTypeID: string;
  roomTypeName: string;
  weekdayRate: number; // Mon-Thu base rate
  weekendRate: number; // Fri-Sun rate
  holidayRate: number; // Special dates
  highSeasonMultiplier: number; // e.g., 1.5x for peak season
  effectiveFrom: string; // Date when this rule starts
  effectiveTo?: string; // Optional end date
}

// Special pricing for specific dates
export interface SpecialPriceDate {
  dateID: string;
  date: string; // YYYY-MM-DD format
  roomTypeID: string;
  roomTypeName: string;
  specialPrice: number;
  reason: string; // e.g., "Tết Holiday", "Christmas"
  isActive: boolean;
}

// Form data for creating/editing pricing rules
export interface PricingRuleFormData {
  roomTypeID: string;
  weekdayRate: number;
  weekendRate: number;
  holidayRate: number;
  highSeasonMultiplier: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

// Form data for special dates
export interface SpecialPriceDateFormData {
  date: string;
  roomTypeID: string;
  specialPrice: number;
  reason: string;
}

// Calendar event for pricing calendar
export interface PricingCalendarEvent {
  id: string;
  title: string;
  date: Date;
  price: number;
  roomTypeName: string;
  color: string;
}
