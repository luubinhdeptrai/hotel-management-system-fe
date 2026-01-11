"use client";

import { useState } from "react";
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
import { ICONS } from "@/src/constants/icons.enum";
import { transactionService } from "@/lib/services";
import type { PaymentMethod } from "@/lib/types/api";
import { useAuth } from "@/hooks/use-auth";

interface DepositConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId: string;
  bookingCode: string;
  totalAmount: number;
  depositRequired: number;
  customerName: string;
}

/**
 * Deposit Confirmation Modal
 *
 * CRITICAL UI RULES (per booking-flow-complete.md):
 * - NO amount input fields - backend auto-calculates
 * - Only payment method selection
 * - Checkbox to confirm payment received
 * - Display amounts as read-only text
 */
export function DepositConfirmationModal({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  bookingCode,
  totalAmount,
  depositRequired,
  customerName,
}: DepositConfirmationModalProps) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirmDeposit = async () => {
    if (!isConfirmed) {
      setError("Vui lòng xác nhận đã nhận thanh toán từ khách hàng");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call transaction API - backend will auto-calculate deposit amount
      const response = await transactionService.createTransaction({
        bookingId,
        paymentMethod,
        transactionType: "DEPOSIT",
      });

      console.log("Deposit confirmed:", response);

      // Success - close modal and notify parent
      onSuccess();
      onClose();

      // Reset form
      setIsConfirmed(false);
      setPaymentMethod("CASH");
    } catch (err) {
      console.error("Deposit confirmation failed:", err);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xác Nhận Thanh Toán Đặt Cọc</DialogTitle>
          <DialogDescription>
            Xác nhận đã nhận tiền cọc từ khách hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Booking Summary */}
          <div className="rounded-lg bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Mã đặt phòng:</span>
              <span className="font-medium">{bookingCode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Khách hàng:</span>
              <span className="font-medium">{customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-600">Cần đặt cọc (30%):</span>
              <span className="font-bold text-primary-600 text-lg">
                {formatCurrency(depositRequired)}
              </span>
            </div>
          </div>

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
              </SelectContent>
            </Select>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-3 rounded-md border border-primary-200 bg-primary-50 p-4">
            <Checkbox
              id="confirmPayment"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked === true)}
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
                  {formatCurrency(depositRequired)}
                </span>{" "}
                bằng phương thức đã chọn
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center gap-2">
                {ICONS.ALERT_CIRCLE}
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Important Note */}
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Lưu ý:</strong> Số tiền đặt cọc sẽ được hệ thống tự động
              tính toán (tối thiểu 30% tổng tiền đặt phòng). Sau khi xác nhận,
              trạng thái đặt phòng sẽ chuyển sang &ldquo;Đã xác nhận&rdquo;.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirmDeposit}
            disabled={!isConfirmed || isLoading}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {isLoading ? "Đang xử lý..." : "Xác Nhận Đặt Cọc"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
