"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PostPaymentFormData } from "@/lib/types/folio";
import { PAYMENT_METHOD_LABELS } from "@/lib/types/folio";

interface PostPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostPaymentFormData) => void;
  balance: number;
}

type PaymentMethod = "CASH" | "CARD" | "TRANSFER";
type PaymentMode = "PAYMENT" | "DEPOSIT";

export function PostPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  balance,
}: PostPaymentModalProps) {
  const [mode, setMode] = useState<PaymentMode>("PAYMENT");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string>("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Validate amount on change
  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numericAmount = parseFloat(value);
    
    // Only validate for PAYMENT mode, DEPOSIT has no limit
    if (mode === "PAYMENT" && value && numericAmount > balance) {
      setValidationError(`Số tiền thanh toán không được vượt quá số dư cần thanh toán (${formatCurrency(balance)})`);
    } else {
      setValidationError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !paymentMethod) {
      return;
    }

    const numericAmount = parseFloat(amount);
    
    // Final validation before submit - only for PAYMENT mode
    if (mode === "PAYMENT" && numericAmount > balance) {
      setValidationError(`Số tiền thanh toán không được vượt quá số dư cần thanh toán (${formatCurrency(balance)})`);
      return;
    }

    onSubmit({
      amount: numericAmount,
      paymentMethod,
      reference: reference || undefined,
      notes: notes || undefined,
      mode,
    });

    // Reset form
    setMode("PAYMENT");
    setAmount("");
    setPaymentMethod("CASH");
    setReference("");
    setNotes("");
    setValidationError("");
    onClose();
  };

  const handleClose = () => {
    setMode("PAYMENT");
    setAmount("");
    setPaymentMethod("CASH");
    setReference("");
    setNotes("");
    setValidationError("");
    onClose();
  };

  const handlePayFullBalance = () => {
    setAmount(balance.toString());
    setValidationError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ghi nhận thanh toán (Post Payment)</DialogTitle>
          <DialogDescription>
            Ghi nhận thanh toán từ khách hàng. Số tiền sẽ được tính vào cột Credit.
          </DialogDescription>
        </DialogHeader>

        {/* Payment Mode Selection */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setMode("PAYMENT");
                setValidationError("");
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                mode === "PAYMENT"
                  ? "bg-success-600 text-white shadow-md"
                  : "bg-white text-gray-600 border-2 border-gray-300 hover:border-success-300"
              }`}
            >
              Thanh toán
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("DEPOSIT");
                setValidationError("");
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                mode === "DEPOSIT"
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-white text-gray-600 border-2 border-gray-300 hover:border-primary-300"
              }`}
            >
              Đặt cọc
            </button>
          </div>
        </div>

        {balance > 0 && mode === "PAYMENT" && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-sm text-amber-800">
              Số dư cần thanh toán:{" "}
              <strong className="text-amber-900">
                {formatCurrency(balance)}
              </strong>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handlePayFullBalance}
            >
              Thanh toán toàn bộ
            </Button>
          </div>
        )}

        {mode === "DEPOSIT" && (
          <div className="bg-primary-50 border border-primary-200 rounded-md p-3">
            <p className="text-sm text-primary-800">
              <strong>Đặt cọc:</strong> Khách có thể đặt cọc bất kỳ số tiền nào, không giới hạn theo số dư hiện tại.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">
              {mode === "PAYMENT" ? "Số tiền thanh toán (VND)" : "Số tiền đặt cọc (VND)"}
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              min="0"
              step="1000"
              required
              className={validationError ? "border-error-500 focus:ring-error-500" : ""}
            />
            {validationError && (
              <p className="text-sm text-error-600 flex items-center gap-1">
                <span>⚠️</span>
                {validationError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Phương thức thanh toán</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
            >
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map(
                  (method) => (
                    <SelectItem key={method} value={method}>
                      {PAYMENT_METHOD_LABELS[method]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {paymentMethod !== "CASH" && (
            <div className="space-y-2">
              <Label htmlFor="reference">
                Số tham chiếu{" "}
                {paymentMethod === "CARD" ? "(thẻ)" : "(chuyển khoản)"}
              </Label>
              <Input
                id="reference"
                placeholder={
                  paymentMethod === "CARD"
                    ? "4 số cuối thẻ hoặc mã giao dịch"
                    : "Mã giao dịch chuyển khoản"
                }
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú nếu có"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!amount || !paymentMethod || !!validationError}
              className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-500"
            >
              Ghi nhận thanh toán
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
