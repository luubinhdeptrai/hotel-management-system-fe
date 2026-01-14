"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ICONS } from "@/src/constants/icons.enum";
import { transactionService } from "@/lib/services";
import type { PaymentMethod, Booking } from "@/lib/types/api";

interface FinalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  booking: Booking;
}

/**
 * Final Payment Modal for Check-out
 *
 * Uses booking data directly (no /bill endpoint) to display:
 * - Room charges from bookingRooms
 * - Total amount, paid amount, and remaining balance
 *
 * Creates ROOM_CHARGE transaction via backend API
 */
export function FinalPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  booking,
}: FinalPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Compute bill data from booking
  const billData = useMemo(() => {
    const totalAmount = parseFloat(booking.totalAmount || "0");
    const totalPaid = parseFloat(booking.totalPaid || "0");
    const balance = parseFloat(booking.balance || "0");
    const depositRequired = parseFloat(booking.depositRequired || "0");

    // Calculate nights
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Build breakdown from booking rooms
    const breakdown: Array<{ description: string; amount: number }> = [];

    if (booking.bookingRooms && booking.bookingRooms.length > 0) {
      booking.bookingRooms.forEach((br) => {
        const roomNumber = br.room?.roomNumber || br.roomId;
        const roomTypeName = br.roomType?.name || "Room";
        const pricePerNight = parseFloat(br.pricePerNight || "0");
        const roomTotal = parseFloat(
          br.totalAmount || String(pricePerNight * nights)
        );

        breakdown.push({
          description: `${roomTypeName} - Phòng ${roomNumber} (${nights} đêm x ${formatCurrency(
            pricePerNight
          )})`,
          amount: roomTotal,
        });
      });
    } else {
      // Fallback if no room details
      breakdown.push({
        description: `Tiền phòng (${nights} đêm)`,
        amount: totalAmount,
      });
    }

    // Add deposit as negative (already paid)
    if (totalPaid > 0) {
      breakdown.push({
        description: "Đã thanh toán (đặt cọc)",
        amount: -totalPaid,
      });
    }

    return {
      customerName: booking.primaryCustomer?.fullName || "Khách hàng",
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      nights,
      totalAmount,
      totalPaid,
      remainingBalance: balance,
      breakdown,
    };
  }, [booking]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsConfirmed(false);
      setPaymentMethod("CASH");
      setError("");
    }
  }, [isOpen]);

  const handleConfirmPayment = async () => {
    if (!isConfirmed) {
      setError("Vui lòng xác nhận đã nhận thanh toán từ khách hàng");
      return;
    }

    if (billData.remainingBalance <= 0) {
      setError("Không có số tiền cần thanh toán");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Create ROOM_CHARGE transaction - backend auto-calculates remaining balance
      const response = await transactionService.createTransaction({
        bookingId: booking.id,
        paymentMethod,
        transactionType: "ROOM_CHARGE",
      });

      console.log("Final payment confirmed:", response);

      // Success - close modal and notify parent
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Payment confirmation failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Không thể xác nhận thanh toán. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsConfirmed(false);
      setPaymentMethod("CASH");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thanh Toán Cuối Cùng</DialogTitle>
          <DialogDescription>
            Hóa đơn chi tiết và xác nhận thanh toán trước khi trả phòng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Bill Header */}
          <div className="rounded-lg bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Mã đặt phòng:</span>
              <span className="font-medium">{booking.bookingCode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Khách hàng:</span>
              <span className="font-medium">{billData.customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-medium">
                {new Date(billData.checkInDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-medium">
                {new Date(billData.checkOutDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Số đêm:</span>
              <span className="font-medium">{billData.nights} đêm</span>
            </div>
          </div>

          {/* Bill Breakdown */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Chi tiết hóa đơn</h4>
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-200">
              {billData.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between p-3 text-sm">
                  <span className="text-gray-700">{item.description}</span>
                  <span
                    className={
                      item.amount < 0
                        ? "text-green-600 font-medium"
                        : "font-medium"
                    }
                  >
                    {item.amount < 0 ? "-" : ""}
                    {formatCurrency(Math.abs(item.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="rounded-lg bg-primary-50 border border-primary-200 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Tổng cộng:</span>
              <span className="font-semibold">
                {formatCurrency(billData.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Đã thanh toán:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(billData.totalPaid)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between pt-2">
              <span className="font-semibold text-base">Còn lại phải trả:</span>
              <span className="font-bold text-primary-600 text-xl">
                {formatCurrency(billData.remainingBalance)}
              </span>
            </div>
          </div>

          {billData.remainingBalance > 0 && (
            <>
              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as PaymentMethod)
                  }
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Tiền mặt</SelectItem>
                    <SelectItem value="CREDIT_CARD">Thẻ tín dụng</SelectItem>
                    <SelectItem value="DEBIT_CARD">Thẻ ghi nợ</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                    <SelectItem value="MOMO">MoMo</SelectItem>
                    <SelectItem value="ZALOPAY">ZaloPay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start space-x-3 rounded-md border border-primary-200 bg-primary-50 p-4">
                <Checkbox
                  id="confirmPayment"
                  checked={isConfirmed}
                  onCheckedChange={(checked) =>
                    setIsConfirmed(checked === true)
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor="confirmPayment"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Xác nhận đã nhận thanh toán
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Tôi xác nhận khách hàng đã thanh toán số tiền{" "}
                    <span className="font-semibold">
                      {formatCurrency(billData.remainingBalance)}
                    </span>{" "}
                    bằng phương thức đã chọn
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center gap-2">
                {ICONS.ALERT_CIRCLE}
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Status Messages */}
          {billData.remainingBalance > 0 ? (
            <Alert>
              <AlertDescription className="text-xs">
                <strong>Lưu ý:</strong> Sau khi xác nhận thanh toán, bạn có thể
                tiến hành check-out cho khách.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="flex items-center gap-2 text-green-800">
                {ICONS.CHECK}
                <span className="font-medium">
                  Đã thanh toán đầy đủ. Có thể tiến hành check-out.
                </span>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {billData.remainingBalance > 0 ? "Hủy" : "Đóng"}
          </Button>
          {billData.remainingBalance > 0 && (
            <Button
              type="button"
              onClick={handleConfirmPayment}
              disabled={!isConfirmed || isLoading}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {isLoading ? "Đang xử lý..." : "Xác Nhận Thanh Toán"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}
