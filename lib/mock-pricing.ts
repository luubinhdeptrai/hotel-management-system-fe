import {
  PricingRule,
  SpecialPriceDate,
  PricingCalendarEvent,
} from "@/lib/types/pricing";

// Mock Pricing Rules
export const mockPricingRules: PricingRule[] = [
  {
    ruleID: "PR001",
    roomTypeID: "STD",
    roomTypeName: "Standard",
    weekdayRate: 500000, // 500k VND on Mon-Thu
    weekendRate: 700000, // 700k VND on Fri-Sun
    holidayRate: 900000, // 900k VND on holidays
    highSeasonMultiplier: 1.5, // 50% increase during high season
    effectiveFrom: "2025-01-01",
  },
  {
    ruleID: "PR002",
    roomTypeID: "DLX",
    roomTypeName: "Deluxe",
    weekdayRate: 800000,
    weekendRate: 1000000,
    holidayRate: 1300000,
    highSeasonMultiplier: 1.5,
    effectiveFrom: "2025-01-01",
  },
  {
    ruleID: "PR003",
    roomTypeID: "SUT",
    roomTypeName: "Suite",
    weekdayRate: 1200000,
    weekendRate: 1500000,
    holidayRate: 1800000,
    highSeasonMultiplier: 1.6,
    effectiveFrom: "2025-01-01",
  },
  {
    ruleID: "PR004",
    roomTypeID: "PRES",
    roomTypeName: "Presidential Suite",
    weekdayRate: 2500000,
    weekendRate: 3000000,
    holidayRate: 3500000,
    highSeasonMultiplier: 1.7,
    effectiveFrom: "2025-01-01",
  },
];

// Mock Special Price Dates
export const mockSpecialPriceDates: SpecialPriceDate[] = [
  {
    dateID: "SPD001",
    date: "2025-12-24",
    roomTypeID: "STD",
    roomTypeName: "Standard",
    specialPrice: 1200000,
    reason: "Christmas Eve",
    isActive: true,
  },
  {
    dateID: "SPD002",
    date: "2025-12-25",
    roomTypeID: "STD",
    roomTypeName: "Standard",
    specialPrice: 1200000,
    reason: "Christmas Day",
    isActive: true,
  },
  {
    dateID: "SPD003",
    date: "2025-12-31",
    roomTypeID: "DLX",
    roomTypeName: "Deluxe",
    specialPrice: 2000000,
    reason: "New Year's Eve",
    isActive: true,
  },
  {
    dateID: "SPD004",
    date: "2026-01-01",
    roomTypeID: "DLX",
    roomTypeName: "Deluxe",
    specialPrice: 2000000,
    reason: "New Year's Day",
    isActive: true,
  },
  {
    dateID: "SPD005",
    date: "2026-02-10",
    roomTypeID: "SUT",
    roomTypeName: "Suite",
    specialPrice: 3000000,
    reason: "Tết (Lunar New Year)",
    isActive: true,
  },
  {
    dateID: "SPD006",
    date: "2026-02-11",
    roomTypeID: "SUT",
    roomTypeName: "Suite",
    specialPrice: 3000000,
    reason: "Tết Day 2",
    isActive: true,
  },
  {
    dateID: "SPD007",
    date: "2026-02-12",
    roomTypeID: "SUT",
    roomTypeName: "Suite",
    specialPrice: 3000000,
    reason: "Tết Day 3",
    isActive: true,
  },
];

// Helper: Get pricing rule by room type
export const getPricingRuleByRoomType = (
  roomTypeID: string
): PricingRule | undefined => {
  return mockPricingRules.find((rule) => rule.roomTypeID === roomTypeID);
};

// Helper: Get special prices for a specific date
export const getSpecialPricesForDate = (date: string): SpecialPriceDate[] => {
  return mockSpecialPriceDates.filter((sp) => sp.date === date && sp.isActive);
};

// Helper: Calculate price for a specific date and room type
export const calculatePriceForDate = (
  roomTypeID: string,
  date: Date
): number => {
  const dateStr = date.toISOString().split("T")[0];

  // Check for special price first
  const specialPrice = mockSpecialPriceDates.find(
    (sp) => sp.roomTypeID === roomTypeID && sp.date === dateStr && sp.isActive
  );
  if (specialPrice) {
    return specialPrice.specialPrice;
  }

  // Get pricing rule
  const rule = getPricingRuleByRoomType(roomTypeID);
  if (!rule) return 0;

  // Determine if weekend (Friday = 5, Saturday = 6, Sunday = 0)
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;

  return isWeekend ? rule.weekendRate : rule.weekdayRate;
};

// Helper: Convert special dates to calendar events
export const convertToCalendarEvents = (): PricingCalendarEvent[] => {
  return mockSpecialPriceDates
    .filter((sp) => sp.isActive)
    .map((sp) => ({
      id: sp.dateID,
      title: `${sp.roomTypeName}: ${new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(sp.specialPrice)}`,
      date: new Date(sp.date),
      price: sp.specialPrice,
      roomTypeName: sp.roomTypeName,
      color: getColorForRoomType(sp.roomTypeID),
    }));
};

// Helper: Get color for room type
const getColorForRoomType = (roomTypeID: string): string => {
  const colors: Record<string, string> = {
    STD: "#3b82f6", // blue
    DLX: "#8b5cf6", // purple
    SUT: "#f59e0b", // amber
    PRES: "#ef4444", // red
  };
  return colors[roomTypeID] || "#6b7280"; // gray default
};
