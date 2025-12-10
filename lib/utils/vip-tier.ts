import type { VIPTier } from "@/lib/types/customer";
import { VIP_TIER_THRESHOLDS } from "@/lib/types/customer";

// Helper function to calculate VIP tier based on total spending
export const calculateVIPTier = (totalSpent: number): VIPTier => {
  if (totalSpent >= VIP_TIER_THRESHOLDS.PLATINUM) {
    return "PLATINUM";
  } else if (totalSpent >= VIP_TIER_THRESHOLDS.VIP) {
    return "VIP";
  } else {
    return "STANDARD";
  }
};

// Helper function to get progress to next tier
export const getNextTierProgress = (
  totalSpent: number
): {
  currentTier: VIPTier;
  nextTier: VIPTier | null;
  progressPercentage: number;
  amountToNextTier: number;
} => {
  const currentTier = calculateVIPTier(totalSpent);

  if (currentTier === "PLATINUM") {
    return {
      currentTier,
      nextTier: null,
      progressPercentage: 100,
      amountToNextTier: 0,
    };
  }

  const nextTier: VIPTier = currentTier === "STANDARD" ? "VIP" : "PLATINUM";
  const nextThreshold = VIP_TIER_THRESHOLDS[nextTier];
  const currentThreshold = VIP_TIER_THRESHOLDS[currentTier];
  const range = nextThreshold - currentThreshold;
  const progress = totalSpent - currentThreshold;
  const progressPercentage = Math.min((progress / range) * 100, 100);
  const amountToNextTier = Math.max(nextThreshold - totalSpent, 0);

  return {
    currentTier,
    nextTier,
    progressPercentage,
    amountToNextTier,
  };
};
