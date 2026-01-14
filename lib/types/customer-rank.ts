/**
 * Customer Rank Types
 * Based on Backend schema: roommaster-be/prisma/schema.prisma
 *
 * Backend automatically determines rank based on totalSpent:
 * - Customer.totalSpent (cached from completed transactions)
 * - Customer.rankId (updated when totalSpent changes)
 * - CustomerRank.minSpending / maxSpending (thresholds)
 */

export interface CustomerRank {
  id: string;
  name: string; // Unique identifier: "VIP1", "VIP2", etc.
  displayName: string; // "Khách hàng Vàng", "Khách hàng Bạc", etc.
  description?: string | null; // Optional description
  minSpending: number | string; // Minimum spending threshold (VND)
  maxSpending: number | string | null; // Max spending
  benefits?: string | Record<string, any> | null; // JSON object or string
  color?: string | null; // Hex code or color name
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRankRequest {
  name?: string;
  displayName: string;
  minSpending: number;
  maxSpending?: number | null;
  benefits: string;
  color: string;
}

export interface UpdateCustomerRankRequest {
  name?: string;
  displayName?: string;
  minSpending?: number;
  maxSpending?: number | null;
  benefits?: string;
  color?: string;
}

export interface CustomerRankStatistics {
  totalRanks: number;
  totalCustomers: number;
  customersWithoutRank: number;
  mostPopularRank: {
    displayName: string;
    customerCount: number;
  } | null;
  rankBreakdown: Array<{
    rankId: string;
    displayName: string;
    customerCount: number;
    minSpending: number;
    maxSpending: number | null;
  }>;
}

export interface SetCustomerRankRequest {
  rankId: string | null;
}

interface RankColorClasses {
  bg: string;
  text: string;
  border: string;
}

/**
 * Get rank badge color classes by color name or hex
 */
export function getRankColor(color: string): RankColorClasses {
  // If color is a hex code, map to color name
  const hexToColorMap: Record<string, string> = {
    "#CD7F32": "bronze", // bronze
    "#C0C0C0": "silver", // silver
    "#FFD700": "gold", // gold
    "#E5E4E2": "platinum", // platinum
    "#B9F2FF": "diamond", // diamond
  };

  const colorName = hexToColorMap[color] || color?.toLowerCase() || "silver";

  const colorMap: Record<string, RankColorClasses> = {
    bronze: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-300",
    },
    silver: {
      bg: "bg-gray-200",
      text: "text-gray-800",
      border: "border-gray-400",
    },
    gold: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-300",
    },
    platinum: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-300",
    },
    diamond: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-300",
    },
  };

  return colorMap[colorName] || colorMap.silver;
}

/**
 * Format spending amount
 */
export function formatSpending(amount: number | string | undefined): string {
  if (!amount) return "0";
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return "0";
  if (numAmount >= 1000000) {
    return `${(numAmount / 1000000).toFixed(1)}M`;
  }
  if (numAmount >= 1000) {
    return `${(numAmount / 1000).toFixed(0)}K`;
  }
  return numAmount.toLocaleString("vi-VN");
}

/**
 * Get rank display name with fallback
 */
export function getRankDisplayName(rank: CustomerRank | null): string {
  if (!rank) return "Chưa có hạng";
  return rank.displayName;
}

/**
 * Parse benefits JSON
 * Accepts string (JSON string from DB) or Record object
 */
export function parseBenefits(
  benefits: string | Record<string, any> | undefined
): Record<string, any> {
  if (!benefits) return {};

  // If already an object, return it
  if (typeof benefits === "object" && benefits !== null) {
    return benefits;
  }

  // If string, try to parse JSON
  if (typeof benefits === "string") {
    try {
      const parsed = JSON.parse(benefits);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }

  return {};
}
