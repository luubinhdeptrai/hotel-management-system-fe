/**
 * Customer Promotion Card Component
 * Displays promotion information for customers (simpler version)
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { promotionService } from "@/lib/services/promotion.service";
import type { Promotion, CustomerPromotion } from "@/lib/types/promotion";
import {
  CalendarIcon,
  Tag,
  TrendingUp,
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CustomerPromotionCardProps {
  promotion: Promotion;
  customerPromotion?: CustomerPromotion; // If claimed
  onClaim?: (code: string) => void;
  showClaimButton?: boolean;
}

export function CustomerPromotionCard({
  promotion,
  customerPromotion,
  onClaim,
  showClaimButton = false,
}: CustomerPromotionCardProps) {
  const isActive = promotionService.isPromotionActive(promotion);
  const isClaimed = !!customerPromotion;
  const isUsed = customerPromotion?.status === "USED";
  const isExpired = customerPromotion?.status === "EXPIRED";
  const isAvailable = customerPromotion?.status === "AVAILABLE";

  // Calculate remaining percentage
  const remainingPercent =
    promotion.totalQty && promotion.remainingQty !== null
      ? (promotion.remainingQty / promotion.totalQty) * 100
      : 100;

  // Format dates - safely parse dates that might be strings or Date objects
  const parseDate = (dateValue: string | Date | null | undefined): Date | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) {
      // Verify it's a valid date
      if (isNaN(dateValue.getTime())) return null;
      return dateValue;
    }
    
    // String parsing with validation
    if (typeof dateValue === "string") {
      const trimmed = dateValue.trim();
      if (!trimmed) return null;
      
      const parsed = new Date(trimmed);
      if (isNaN(parsed.getTime())) {
        console.warn("Invalid date string in customer promotion card:", {
          dateValue: trimmed,
          code: promotion.code,
        });
        return null;
      }
      return parsed;
    }
    
    return null;
  };

  const startDateObj = parseDate(promotion.startDate);
  const endDateObj = parseDate(promotion.endDate);

  const startDate = startDateObj 
    ? format(startDateObj, "MMM dd, yyyy") 
    : "N/A";
  const endDate = endDateObj 
    ? format(endDateObj, "MMM dd, yyyy") 
    : "N/A";

  // Get customer promotion status badge
  const getCustomerStatusBadge = () => {
    if (!customerPromotion) return null;

    switch (customerPromotion.status) {
      case "AVAILABLE":
        return (
          <Badge variant="default" className="gap-1 bg-green-600 text-white hover:bg-green-700">
            <CheckCircle2 className="h-3 w-3" />
            Ready to Use
          </Badge>
        );
      case "USED":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Used
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Expired
          </Badge>
        );
    }
  };

  // Scope badge
  const getScopeBadge = () => {
    const colors = {
      ALL: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      ROOM: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      SERVICE:
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    };

    const labels = {
      ALL: "All Services",
      ROOM: "Room Only",
      SERVICE: "Service Only",
    };

    return (
      <Badge className={cn("gap-1", colors[promotion.scope])}>
        <Tag className="h-3 w-3" />
        {labels[promotion.scope]}
      </Badge>
    );
  };

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-shadow",
        !isActive && !isClaimed && "opacity-60",
        isAvailable && "border-primary shadow-md"
      )}
    >
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-2xl font-bold">
                  {promotion.code}
                </CardTitle>
                {getScopeBadge()}
              </div>
              {getCustomerStatusBadge()}
            </div>
          </div>

          {promotion.description && (
            <CardDescription className="text-sm">
              {promotion.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Discount Value - Prominent Display */}
        <div className="bg-linear-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground rounded-xl p-6 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <div className="text-sm font-medium opacity-90">Save</div>
          </div>
          <div className="text-4xl font-bold tracking-tight">
            {promotionService.formatPromotionValue(promotion)}
          </div>
          {promotion.type === "PERCENTAGE" && promotion.maxDiscount && (
            <div className="text-xs opacity-80 mt-2">
              Max discount:{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(parseFloat(promotion.maxDiscount))}
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-3 text-sm">
          {/* Valid Period */}
          <div className="flex items-start gap-3">
            <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-medium">Valid Period</div>
              <div className="text-muted-foreground">
                {startDate} → {endDate}
              </div>
            </div>
          </div>

          {/* Min Amount */}
          {parseFloat(promotion.minBookingAmount) > 0 && (
            <div className="flex items-start gap-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-medium">Minimum Booking</div>
                <div className="text-muted-foreground">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(parseFloat(promotion.minBookingAmount))}
                </div>
              </div>
            </div>
          )}

          {/* Per Customer Limit */}
          <div className="flex items-start gap-3">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-medium">Usage Limit</div>
              <div className="text-muted-foreground">
                {promotion.perCustomerLimit} time(s) per customer
              </div>
            </div>
          </div>

          {/* Claimed Info (if customer claimed) */}
          {customerPromotion && (
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-medium">Claimed On</div>
                <div className="text-muted-foreground">
                  {format(new Date(customerPromotion.claimedAt), "PPP")}
                </div>
                {customerPromotion.usedAt && (
                  <div className="text-muted-foreground text-xs mt-1">
                    Used on:{" "}
                    {format(new Date(customerPromotion.usedAt), "PPP")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Availability Progress */}
        {promotion.totalQty && remainingPercent <= 50 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Remaining</span>
              <span className="font-medium">
                {promotion.remainingQty || 0} / {promotion.totalQty}
              </span>
            </div>
            <Progress
              value={remainingPercent}
              className={cn(
                "h-1.5",
                remainingPercent <= 10 && "[&>div]:bg-red-500",
                remainingPercent > 10 &&
                  remainingPercent <= 30 &&
                  "[&>div]:bg-yellow-500"
              )}
            />
            {remainingPercent <= 20 && (
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                ⚡ Limited quantity! Claim now before it runs out.
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Claim Button */}
      {showClaimButton && onClaim && !isClaimed && isActive && (
        <CardFooter className="border-t pt-4">
          <Button
            onClick={() => onClaim(promotion.code)}
            className="w-full gap-2"
            size="lg"
          >
            <Tag className="h-4 w-4" />
            Claim This Promotion
          </Button>
        </CardFooter>
      )}

      {/* Status Footer for Claimed */}
      {isClaimed && (
        <CardFooter className="border-t pt-4 bg-muted/30">
          <div className="w-full text-center text-sm">
            {isAvailable && (
              <p className="text-primary font-medium">
                ✨ Ready to use! Apply this during payment.
              </p>
            )}
            {isUsed && (
              <p className="text-muted-foreground">
                This promotion has been used on{" "}
                {customerPromotion.usedAt &&
                  format(new Date(customerPromotion.usedAt), "PPP")}
              </p>
            )}
            {isExpired && (
              <p className="text-destructive">This promotion has expired.</p>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
