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
  displayName: string; // "Khách hàng Vàng", "Khách hàng Bạc", etc.
  minSpending: number; // Minimum spending threshold (VND)
  maxSpending: number | null; // Max spending (null for highest tier)
  benefits: Record<string, any>; // JSON object describing benefits
  color: string; // Color name: "gold", "silver", "bronze", etc.
}

export interface CreateCustomerRankRequest {
  displayName: string;
  minSpending: number;
  maxSpending?: number | null;
  benefits: Record<string, any>;
  color: string;
}

export interface UpdateCustomerRankRequest {
  displayName?: string;
  minSpending?: number;
  maxSpending?: number | null;
  benefits?: Record<string, any>;
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
 * Get rank badge color classes by color name
 */
export function getRankColor(colorName: string): RankColorClasses {
  const colorMap: Record<string, RankColorClasses> = {
    bronze: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
    silver: { bg: "bg-gray-200", text: "text-gray-800", border: "border-gray-400" },
    gold: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
    platinum: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
    diamond: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  };
  
  return colorMap[colorName?.toLowerCase()] || colorMap.silver;
}

/**
 * Format spending amount
 */
export function formatSpending(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toLocaleString("vi-VN");
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
 */
export function parseBenefits(benefits: Record<string, any>): string[] {
  if (!benefits) return [];
  try {
    return Object.entries(benefits).map(([key, value]) => `${key}: ${value}`);
  } catch {
    return [];
  }
}
