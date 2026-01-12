/**
 * RankBadge Component
 * Display customer rank as a modern, polished badge
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CustomerRank } from "@/lib/types/customer-rank";
import { getRankColor } from "@/lib/types/customer-rank";

interface RankBadgeProps {
  rank?: CustomerRank | null;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RankBadge({ rank, className, showIcon = true, size = "md" }: RankBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  if (!rank) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "font-medium text-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-2 border-gray-300 shadow-sm hover:shadow-md transition-all",
          sizeClasses[size],
          className
        )}
      >
        {showIcon && <span className="mr-1.5 opacity-70">○</span>}
        Chưa có hạng
      </Badge>
    );
  }

  const color = getRankColor(rank.color);

  return (
    <Badge
      className={cn(
        "font-semibold border-2 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105",
        color.bg,
        color.text,
        color.border,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <span className="mr-1.5 animate-pulse">★</span>}
      {rank.displayName}
    </Badge>
  );
}
