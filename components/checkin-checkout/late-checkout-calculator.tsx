"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ICONS } from "@/src/constants/icons.enum";

interface LateCheckoutCalculatorProps {
  checkoutTime: string; // HH:mm format
  roomRate: number;
}

interface LateCheckoutFee {
  amount: number;
  percentage: number;
  description: string;
  isFree: boolean;
  isLate: boolean;
}

/**
 * Calculate late checkout fee based on time
 * Rules from Module 16:
 * - Before 14:00: Free
 * - 14:00-18:00: 50% of room rate
 * - After 18:00: 100% of room rate
 */
export function calculateLateCheckoutFee(
  checkoutTime: string,
  roomRate: number
): LateCheckoutFee {
  const [hours, minutes] = checkoutTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;

  // Standard checkout is 12:00 (noon)
  const standardCheckout = 12 * 60; // 720 minutes
  const lateCheckoutStart = 14 * 60; // 840 minutes (14:00)
  const extraLateStart = 18 * 60; // 1080 minutes (18:00)

  if (totalMinutes <= lateCheckoutStart) {
    // Before 14:00 - Free (grace period)
    return {
      amount: 0,
      percentage: 0,
      description: "Miễn phí (trước 14:00)",
      isFree: true,
      isLate: totalMinutes > standardCheckout,
    };
  } else if (totalMinutes <= extraLateStart) {
    // 14:00-18:00 - 50% charge
    return {
      amount: roomRate * 0.5,
      percentage: 50,
      description: "Phụ thu 50% (14:00-18:00)",
      isFree: false,
      isLate: true,
    };
  } else {
    // After 18:00 - 100% charge
    return {
      amount: roomRate,
      percentage: 100,
      description: "Phụ thu 100% (sau 18:00)",
      isFree: false,
      isLate: true,
    };
  }
}

export function LateCheckoutCalculator({
  checkoutTime,
  roomRate,
}: LateCheckoutCalculatorProps) {
  const fee = calculateLateCheckoutFee(checkoutTime, roomRate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  if (!fee.isLate) {
    // Not late - don't show anything
    return null;
  }

  if (fee.isFree) {
    // Late but still in grace period
    return (
      <Card className="border-2 border-warning-200 bg-linear-to-br from-warning-50 via-white to-warning-50/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="w-5 h-5 text-white">{ICONS.CLOCK}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold text-gray-900">
                  Trả phòng muộn
                </span>
                <Badge className="bg-success-600 text-white font-semibold">
                  Miễn phí
                </Badge>
              </div>
              <p className="text-sm text-gray-700">
                Thời gian trả phòng: <span className="font-bold">{checkoutTime}</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Khách được miễn phí trả phòng muộn đến 14:00
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Has late checkout fee
  return (
    <Card className="border-2 border-error-200 bg-linear-to-br from-error-50 via-white to-error-50/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-error-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="w-5 h-5 text-white">{ICONS.ALERT_TRIANGLE}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-bold text-gray-900">
                Phụ thu trả phòng muộn
              </span>
              <Badge className="bg-error-600 text-white font-semibold">
                +{fee.percentage}%
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-sm text-gray-700">
                  Thời gian trả phòng: <span className="font-bold">{checkoutTime}</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">{fee.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Phụ thu</p>
                <p className="text-xl font-extrabold text-error-600">
                  {formatCurrency(fee.amount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Early Checkout Refund Calculator
 * Calculate refund when guest checks out before scheduled date
 */

interface EarlyCheckoutRefundProps {
  originalCheckOutDate: string;
  actualCheckOutDate: string;
  nightlyRate: number;
  refundPolicy: "full" | "partial" | "none";
}

interface EarlyCheckoutRefund {
  unusedNights: number;
  refundAmount: number;
  refundPercentage: number;
  description: string;
}

export function calculateEarlyCheckoutRefund(
  originalCheckOutDate: string,
  actualCheckOutDate: string,
  nightlyRate: number,
  refundPolicy: "full" | "partial" | "none" = "partial"
): EarlyCheckoutRefund {
  const original = new Date(originalCheckOutDate);
  const actual = new Date(actualCheckOutDate);

  // Calculate unused nights
  const diffTime = original.getTime() - actual.getTime();
  const unusedNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (unusedNights <= 0) {
    return {
      unusedNights: 0,
      refundAmount: 0,
      refundPercentage: 0,
      description: "Không có đêm chưa sử dụng",
    };
  }

  const unusedAmount = unusedNights * nightlyRate;

  switch (refundPolicy) {
    case "full":
      return {
        unusedNights,
        refundAmount: unusedAmount,
        refundPercentage: 100,
        description: "Hoàn tiền đầy đủ cho các đêm chưa sử dụng",
      };
    case "partial":
      // 50% refund for early checkout
      return {
        unusedNights,
        refundAmount: unusedAmount * 0.5,
        refundPercentage: 50,
        description: "Hoàn tiền 50% cho các đêm chưa sử dụng",
      };
    case "none":
      return {
        unusedNights,
        refundAmount: 0,
        refundPercentage: 0,
        description: "Không hoàn tiền theo chính sách khách sạn",
      };
  }
}

export function EarlyCheckoutRefundCard({
  originalCheckOutDate,
  actualCheckOutDate,
  nightlyRate,
  refundPolicy,
}: EarlyCheckoutRefundProps) {
  const refund = calculateEarlyCheckoutRefund(
    originalCheckOutDate,
    actualCheckOutDate,
    nightlyRate,
    refundPolicy
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (refund.unusedNights <= 0) {
    return null;
  }

  return (
    <Card className="border-2 border-info-200 bg-linear-to-br from-info-50 via-white to-info-50/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-info-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="w-5 h-5 text-white">{ICONS.ARROW_RIGHT_LEFT}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-bold text-gray-900">
                Trả phòng sớm
              </span>
              {refund.refundAmount > 0 ? (
                <Badge className="bg-success-600 text-white font-semibold">
                  Hoàn tiền {refund.refundPercentage}%
                </Badge>
              ) : (
                <Badge variant="outline" className="border-gray-400 text-gray-700 font-semibold">
                  Không hoàn tiền
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                Ngày trả dự kiến: <span className="font-bold">{formatDate(originalCheckOutDate)}</span>
              </p>
              <p>
                Ngày trả thực tế: <span className="font-bold">{formatDate(actualCheckOutDate)}</span>
              </p>
              <p>
                Số đêm chưa sử dụng: <span className="font-bold">{refund.unusedNights} đêm</span>
              </p>
              <p className="text-xs text-gray-600 mt-2">{refund.description}</p>
            </div>
            {refund.refundAmount > 0 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-info-200">
                <span className="text-sm font-semibold text-gray-700">Số tiền hoàn lại:</span>
                <span className="text-xl font-extrabold text-success-600">
                  -{formatCurrency(refund.refundAmount)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
