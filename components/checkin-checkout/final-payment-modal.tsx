"use client";

import { useState, useEffect } from "react";
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
import type { PaymentMethod } from "@/lib/types/api";
import type { BillResponse } from "@/lib/services/transaction.service";
import { useAuth } from "@/hooks/use-auth";

interface FinalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId: string;
  bookingCode: string;
}

/**
 * Final Payment Modal for Check-out
 *
 * CRITICAL UI RULES (per booking-flow-complete.md):
 * - NO amount input fields - backend auto-calculates remaining balance
 * - Only payment method selection
 * - Checkbox to confirm payment received
 * - Display final bill breakdown as read-only
 */
export function FinalPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  bookingCode,
}: FinalPaymentModalProps) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBill, setIsLoadingBill] = useState(false);
  const [error, setError] = useState("");
  const [bill, setBill] = useState<BillResponse | null>(null);

  // Load bill when modal opens
  useEffect(() => {
    const loadBillData = async () => {
      setIsLoadingBill(true);
      setError("");

      try {
        const billData = await transactionService.getBill(bookingId);
        setBill(billData);
      } catch (err) {
        console.error("Failed to load bill:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải hóa đơn. Vui lòng thử lại."
        );
      } finally {
        setIsLoadingBill(false);
      }
    };

    if (isOpen && bookingId) {
      loadBillData();
    }
  }, [isOpen, bookingId]);

  const handleConfirmPayment = async () => {
    if (!isConfirmed) {
      setError("Vui lòng xác nhận đã nhận thanh toán từ khách hàng");
      return;
    }

    if (!bill) {
      setError("Chưa tải được thông tin hóa đơn");
      return;
    }

    if (bill.remainingBalance <= 0) {
      setError("Không có số tiền cần thanh toán");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call transaction API - backend will auto-calculate remaining balance
      const response = await transactionService.createTransaction({
        bookingId,
        paymentMethod,
        transactionType: "ROOM_CHARGE", // or FINAL_PAYMENT based on backend
        employeeId: user?.id || "",
      });

      console.log("Final payment confirmed:", response);

      // Success - close modal and notify parent
      onSuccess();
      onClose();

      // Reset form
      setIsConfirmed(false);
      setPaymentMethod("CASH");
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
      setBill(null);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thanh Toán Cuối Cùng</DialogTitle>
          <DialogDescription>
            Hóa đơn chi tiết và xác nhận thanh toán trước khi trả phòng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoadingBill ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin">{ICONS.LOADER}</div>
                <p className="text-sm text-gray-600">Đang tải hóa đơn...</p>
              </div>
            </div>
          ) : bill ? (
            <>
              {/* Bill Header */}
              <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mã đặt phòng:</span>
                  <span className="font-medium">{bookingCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Khách hàng:</span>
                  <span className="font-medium">{bill.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">
                    {new Date(bill.checkInDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">
                    {new Date(bill.checkOutDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số đêm:</span>
                  <span className="font-medium">{bill.nights} đêm</span>
                </div>
              </div>

              {/* Bill Breakdown */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Chi tiết hóa đơn</h4>
                <div className="rounded-lg border border-gray-200 divide-y divide-gray-200">
                  {bill.breakdown.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-3 text-sm"
                    >
                      <span className="text-gray-700">{item.description}</span>
                      <span
                        className={
                          item.amount < 0
                            ? "text-green-600 font-medium"
                            : "font-medium"
                        }
                      >
                        {formatCurrency(Math.abs(item.amount))}
                        {item.amount < 0 && " (đã trả)"}
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
                    {formatCurrency(bill.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Đã thanh toán:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(bill.paidAmount)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between pt-2">
                  <span className="font-semibold text-base">
                    Còn lại phải trả:
                  </span>
                  <span className="font-bold text-primary-600 text-xl">
                    {formatCurrency(bill.remainingBalance)}
                  </span>
                </div>
              </div>

              {bill.remainingBalance > 0 && (
                <>
                  {/* Payment Method Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">
                      Phương thức thanh toán
                    </Label>
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
                        <SelectItem value="CREDIT_CARD">
                          Thẻ tín dụng
                        </SelectItem>
                        <SelectItem value="DEBIT_CARD">Thẻ ghi nợ</SelectItem>
                        <SelectItem value="BANK_TRANSFER">
                          Chuyển khoản
                        </SelectItem>
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
                          {formatCurrency(bill.remainingBalance)}
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

              {/* Important Note */}
              {bill.remainingBalance > 0 && (
                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Lưu ý:</strong> Số tiền thanh toán sẽ được hệ thống
                    tự động tính toán dựa trên tổng chi phí trừ đi số tiền đã
                    thanh toán. Sau khi xác nhận thanh toán, bạn có thể tiến
                    hành check-out.
                  </AlertDescription>
                </Alert>
              )}

              {bill.remainingBalance <= 0 && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="flex items-center gap-2 text-green-800">
                    {ICONS.CHECK}
                    <span className="font-medium">
                      Đã thanh toán đầy đủ. Có thể tiến hành check-out.
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            error && (
              <Alert variant="destructive">
                <AlertDescription className="flex items-center gap-2">
                  {ICONS.ALERT_CIRCLE}
                  {error}
                </AlertDescription>
              </Alert>
            )
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {bill?.remainingBalance && bill.remainingBalance > 0
              ? "Hủy"
              : "Đóng"}
          </Button>
          {bill && bill.remainingBalance > 0 && (
            <Button
              type="button"
              onClick={handleConfirmPayment}
              disabled={!isConfirmed || isLoading || !bill}
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
