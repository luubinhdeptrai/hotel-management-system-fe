/**
 * Promotion Card Component
 * Modern, production-ready design with gradients, animations and visual polish
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { promotionService } from "@/lib/services/promotion.service";
import type { Promotion } from "@/lib/types/promotion";
import {
  CalendarIcon,
  Edit,
  MoreVertical,
  Power,
  PowerOff,
  Tag,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
  Percent,
  DollarSign,
  CheckCircle2,
  XCircle,
  Zap,
  Gift,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PromotionCardProps {
  promotion: Promotion;
  onEdit?: (promotion: Promotion) => void;
  onDisable?: (id: string) => void;
  onEnable?: (id: string) => void;
}

export function PromotionCard({
  promotion,
  onEdit,
  onDisable,
  onEnable,
}: PromotionCardProps) {
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showEnableDialog, setShowEnableDialog] = useState(false);

  const isActive = promotionService.isPromotionActive(promotion);
  const isDisabled = !!promotion.disabledAt;

  // Calculate remaining percentage
  const remainingPercent =
    promotion.totalQty && promotion.remainingQty !== null
      ? (promotion.remainingQty / promotion.totalQty) * 100
      : 100;

  // Safe date parsing
  const parseDate = (dateValue: string | Date | null | undefined): Date | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) {
      if (isNaN(dateValue.getTime())) return null;
      return dateValue;
    }
    
    if (typeof dateValue === "string") {
      const trimmed = dateValue.trim();
      if (!trimmed) return null;
      
      const parsed = new Date(trimmed);
      if (isNaN(parsed.getTime())) {
        console.warn("Invalid date string received from API:", {
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
  const createdDateObj = parseDate(promotion.createdAt);
  const updatedDateObj = parseDate(promotion.updatedAt);

  const startDate = startDateObj 
    ? format(startDateObj, "MMM dd, yyyy") 
    : "N/A";
  const endDate = endDateObj 
    ? format(endDateObj, "MMM dd, yyyy") 
    : "N/A";
  const createdDate = createdDateObj 
    ? format(createdDateObj, "MMM dd, yyyy HH:mm") 
    : "N/A";
  const updatedDate = updatedDateObj 
    ? format(updatedDateObj, "MMM dd, yyyy HH:mm") 
    : "N/A";

  // Get progress bar color based on remaining percentage
  const getProgressColor = () => {
    if (remainingPercent > 50) return "bg-gradient-to-r from-green-500 to-emerald-600";
    if (remainingPercent > 20) return "bg-gradient-to-r from-yellow-500 to-orange-500";
    return "bg-gradient-to-r from-red-500 to-rose-600";
  };

  // Status badge with modern design
  const getStatusBadge = () => {
    if (isDisabled) {
      return (
        <Badge variant="destructive" className="gap-1.5 px-3 py-1 font-semibold shadow-sm">
          <PowerOff className="h-3.5 w-3.5" />
          Disabled
        </Badge>
      );
    }
    if (isActive) {
      return (
        <Badge className="gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white border-0 shadow-lg shadow-emerald-500/40 font-semibold animate-pulse">
          <Sparkles className="h-3.5 w-3.5 animate-spin" style={{animationDuration: '3s'}} />
          Active Now
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1.5 px-3 py-1 font-medium shadow-sm">
        <Clock className="h-3.5 w-3.5" />
        Scheduled
      </Badge>
    );
  };

  // Scope badge with vibrant gradients
  const getScopeBadge = () => {
    const configs = {
      ALL: {
        gradient: "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500",
        icon: "🌐",
        label: "All Services"
      },
      ROOM: {
        gradient: "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500",
        icon: "🛏️",
        label: "Rooms Only"
      },
      SERVICE: {
        gradient: "bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500",
        icon: "🍽️",
        label: "Services Only"
      },
    };

    const config = configs[promotion.scope];

    return (
      <Badge className={cn(
        "gap-1.5 px-3 py-1 text-white border-0 shadow-lg font-semibold",
        config.gradient
      )}>
        <span>{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  // Type badge with icon
  const getTypeBadge = () => {
    if (promotion.type === "PERCENTAGE") {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-sm">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
            <Percent className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-amber-600 font-medium">Percentage Off</p>
            <p className="text-2xl font-bold text-amber-900">
              {promotionService.formatPromotionValue(promotion)}
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-blue-600 font-medium">Fixed Amount</p>
            <p className="text-2xl font-bold text-blue-900">
              {promotionService.formatPromotionValue(promotion)}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2",
          isActive && !isDisabled && "border-emerald-200 shadow-lg shadow-emerald-100",
          isDisabled && "opacity-60 grayscale"
        )}
      >
        {/* Animated gradient background */}
        {isActive && !isDisabled && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 opacity-50" />
        )}
        
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 shadow-sm">
                  <Tag className="h-4 w-4 text-slate-600" />
                  <CardTitle className="text-xl font-black tracking-tight text-slate-800">
                    {promotion.code}
                  </CardTitle>
                </div>
                {getStatusBadge()}
              </div>

              {getScopeBadge()}

              {promotion.description && (
                <CardDescription className="text-sm leading-relaxed text-slate-600">
                  {promotion.description}
                </CardDescription>
              )}
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit(promotion)}
                    className="gap-2 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Promotion
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {isDisabled ? (
                  onEnable && (
                    <DropdownMenuItem
                      onClick={() => setShowEnableDialog(true)}
                      className="gap-2 cursor-pointer text-green-600"
                    >
                      <Power className="h-4 w-4" />
                      Enable Promotion
                    </DropdownMenuItem>
                  )
                ) : (
                  onDisable && (
                    <DropdownMenuItem
                      onClick={() => setShowDisableDialog(true)}
                      className="gap-2 cursor-pointer text-red-600"
                    >
                      <PowerOff className="h-4 w-4" />
                      Disable Promotion
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Value Display */}
          {getTypeBadge()}

          {/* Validity Period */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="h-4 w-4 text-slate-600" />
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Valid Period
              </p>
            </div>
            <p className="text-sm font-bold text-slate-800">
              {startDate} - {endDate}
            </p>
          </div>

          {/* Quantity Progress */}
          {promotion.totalQty && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-600" />
                  <span className="font-semibold text-slate-700">Availability</span>
                </div>
                <span className="font-bold text-slate-800">
                  {promotion.remainingQty || 0} / {promotion.totalQty}
                </span>
              </div>
              <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full shadow-md",
                    getProgressColor()
                  )}
                  style={{ width: `${remainingPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {remainingPercent.toFixed(0)}% remaining
              </p>
            </div>
          )}

          {/* Usage Stats */}
          {promotion._count && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-600">Claims</p>
                </div>
                <p className="text-2xl font-black text-blue-900">
                  {promotion._count.customerPromotions || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <p className="text-xs font-semibold text-purple-600">Used</p>
                </div>
                <p className="text-2xl font-black text-purple-900">
                  {promotion._count.usedPromotions || 0}
                </p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {promotion.maxDiscount && promotion.type === "PERCENTAGE" && (
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-700 font-medium">
                <Zap className="h-3 w-3 inline mr-1" />
                Max discount: <span className="font-bold">{new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(parseFloat(promotion.maxDiscount))}</span>
              </p>
            </div>
          )}

          {parseFloat(promotion.minBookingAmount) > 0 && (
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-700 font-medium">
                Minimum booking: <span className="font-bold">{new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(parseFloat(promotion.minBookingAmount))}</span>
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="relative pt-4 flex-col items-start gap-2 border-t bg-slate-50/50">
          <div className="w-full text-xs text-slate-500 space-y-1">
            <p>
              <span className="font-medium">Created:</span> {createdDate}
            </p>
            <p>
              <span className="font-medium">Updated:</span> {updatedDate}
            </p>
            <p>
              <span className="font-medium">Per Customer:</span>{" "}
              <span className="font-semibold text-slate-700">{promotion.perCustomerLimit} time(s)</span>
            </p>
          </div>
        </CardFooter>
      </Card>

      {/* Disable Confirmation Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PowerOff className="h-5 w-5 text-red-600" />
              Disable Promotion?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent customers from claiming or using this promotion.
              <br />
              <span className="font-semibold text-slate-700 mt-2 block">
                Promotion: {promotion.code}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDisable?.(promotion.id);
                setShowDisableDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Disable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enable Confirmation Dialog */}
      <AlertDialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Power className="h-5 w-5 text-green-600" />
              Enable Promotion?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will make the promotion available for customers to claim and use again.
              <br />
              <span className="font-semibold text-slate-700 mt-2 block">
                Promotion: {promotion.code}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onEnable?.(promotion.id);
                setShowEnableDialog(false);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Enable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
